import { Component, OnInit } from "@angular/core";
import { NavController, NavParams, ViewController } from "ionic-angular";
import { DeeplinkProvider } from "../../providers/deeplink/deeplink";
import { ProgramServiceProvider } from "../programs/program-service";
import { ProgramSolutionObservationDetailPage } from "../programs/program-solution-observation-detail/program-solution-observation-detail";
import { UtilsProvider } from "../../providers/utils/utils";
import { TranslateService } from "@ngx-translate/core";
import { ProgramSolutionEntityPage } from "../programs/program-solution-entity/program-solution-entity";
import { ObservationReportsPage } from "../observation-reports/observation-reports";
import { DashboardPage } from "../dashboard/dashboard";

/**
 * Generated class for the DeepLinkRedirectPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: "page-deep-link-redirect",
  templateUrl: "deep-link-redirect.html",
})
export class DeepLinkRedirectPage implements OnInit {
  data: any;
  translateObject: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public deeplinkProvider: DeeplinkProvider,
    public programSrvc: ProgramServiceProvider,
    public viewCtrl: ViewController,
    public utils: UtilsProvider,
    private translate: TranslateService
  ) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad DeepLinkRedirectPage");
    this.data = this.navParams.data;
    let key = Object.keys(this.data)[0];
    this.switch(key);
  }
  ngOnInit() {
    this.translate.get(["message.canNotOpenLink"]).subscribe((translations) => {
      this.translateObject = translations;
    });
  }

  switch(key) {
    switch (key) {
      case "observationLink":
        this.redirectObservation(this.data[key]);
        break;
      case "observationParams":
        this.redirectWithParams(this.data[key], "observation");
        break;
      case "assessmentParams":
        this.redirectWithParams(this.data[key], "assessment");
        break;
      case "observationReportParams":
        this.redirectReportWithParams(this.data[key], "observation");
        break;
      case "assessmentReportParams":
        this.redirectReportWithParams(this.data[key], "assessment");
        break;

      default:
        break;
    }
  }

  redirectWithParams(params: string, type) {
    let paramsArr = params.split("-");
    console.log(paramsArr);
    let pId = paramsArr[0];
    let sId = paramsArr[1];
    let eId = paramsArr[2];
    this.programSrvc
      .getProgramApi(true)
      .then((data: any) => {
        console.log(data);
        const pIndex = data.findIndex((p) => p._id == pId);
        let sIndex;

        let page;
        if (type == "observation") {
          page = ProgramSolutionObservationDetailPage;
          const solution = data[pIndex].solutions;
          sIndex = solution.findIndex((s) => s.solutionId == sId);
        } else {
          page = ProgramSolutionEntityPage;
          const solution = data[pIndex].solutions;
          sIndex = solution.findIndex((s) => s._id == sId);
        }
        this.navCtrl
          .push(page, {
            programIndex: pIndex,
            solutionIndex: sIndex,
          })
          .then(() => {
            this.navCtrl.remove(1, 1);
          });
      })
      .catch(() => {
        this.utils.openToast(this.translateObject["message.canNotOpenLink"]);
        this.navCtrl.popToRoot();
      });
  }

  redirectObservation(link) {
    let pId, sId, oId;
    this.deeplinkProvider
      .createObsFromLink(link)
      .then((res: any) => {
        if (!res.result) {
          throw "";
        }
        res = res.result;
        pId = res.programId;
        sId = res.solutionId;
        oId = res._id;
        return this.programSrvc.getProgramApi(true);
      })
      .then((data: any) => {
        console.log(data);
        const pIndex = data.findIndex((p) => p._id == pId);
        const solution = data[pIndex].solutions;
        const sIndex = solution.findIndex((s) => s.solutionId == sId);
        this.navCtrl
          .push(ProgramSolutionObservationDetailPage, {
            programIndex: pIndex,
            solutionIndex: sIndex,
          })
          .then(() => {
            this.navCtrl.remove(1, 1);
          });
      })
      .catch(() => {
        this.utils.openToast(this.translateObject["message.canNotOpenLink"]);
        this.navCtrl.popToRoot();
      });
  }

  redirectReportWithParams(params: string, type) {
    let paramsArr = params.split("-");
    console.log(paramsArr);
    let pId = paramsArr[0];
    let sId = paramsArr[1];
    let eId = paramsArr[2];
    let etype = paramsArr[3];
    let oId = paramsArr[4];

    if (type == "observation") {
      let payload = {
        entityId: eId,
        entityType: etype,
        observationId: oId,
      };
      setTimeout(() => {
        // will go call entity report
        this.navCtrl
          .push(ObservationReportsPage, payload)
          .then(() => {
            this.navCtrl.remove(1, 1);
          })
          .catch((err) => {
            console.log(err);
          });
      }, 1000);
    }

    if (type == "assessment") {
      let payload = {
        programId: pId,
        entity: {
          _id: eId,
          entityType: etype,
        },
        entityType: etype,
        solutionId: sId,
      };
      setTimeout(() => {
        this.navCtrl
          .push(DashboardPage, payload)
          .then(() => {
            this.navCtrl.remove(1, 1);
          })
          .catch((err) => {
            console.log(err);
          });
      }, 1000);
    }
  }
}
