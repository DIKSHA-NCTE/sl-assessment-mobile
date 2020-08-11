import { Component } from "@angular/core";
import { NavController, NavParams, Platform } from "ionic-angular";
import { ApiProvider } from "../../../providers/api/api";
import { UtilsProvider } from "../../../providers/utils/utils";
import { AppConfigs } from "../../../providers/appConfig";
import { AppAvailability } from "@ionic-native/app-availability";
import { Market } from "@ionic-native/market";

/**
 * Generated class for the SuggestedImprovementsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: "page-suggested-improvements",
  templateUrl: "suggested-improvements.html",
})
export class SuggestedImprovementsPage {
  solName: any;
  improvementProject: any;
  solutionId: any;
  entityId: any;
  programId: any;
  entityType: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private apiService: ApiProvider,
    private utils: UtilsProvider,
    private platform: Platform,
    private appAvailability: AppAvailability,
    private market: Market
  ) {
    const dataObj = this.navParams.get("dataObj");
    this.solName = dataObj.heading;
    this.solutionId = dataObj.solutionId;
    this.entityId = dataObj.entityId;
    this.entityType = dataObj.entityType;
    this.programId = dataObj.programId;
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad SuggestedImprovementsPage");
    this.getImprovementProjects();
  }

  getImprovementProjects() {
    let url = AppConfigs.improvementProject.listImprovementProjects;
    let payload = {
      entityType: this.entityType,
      entityId: this.entityId,
      programId: this.programId,
      solutionId: this.solutionId,
    };
    this.utils.startLoader();
    this.apiService.httpPost(
      url,
      payload,
      (success) => {
        this.utils.stopLoader();
        console.log(JSON.stringify(success));

        if (success.result === true && success.data) {
          this.improvementProject = success.data;
        } else {
          this.utils.openToast(success.data);
          this.improvementProject = [];
        }
      },
      (error) => {
        this.improvementProject = [];
        this.utils.openToast(error.message);

        this.utils.stopLoader();
      },
      { baseUrl: "dhiti", version: "v1" }
    );
  }

  openUnnati(id) {
    let app;
    const unnati = AppConfigs.unnatiPackage;

    if (this.platform.is("ios")) {
      app = unnati + "://";
    } else if (this.platform.is("android")) {
      app = "org.shikshalokam." + unnati;
    }

    this.appAvailability.check(app).then(
      (yes: boolean) => {
        console.log(
          "unnati://shikshalokam.org/project-view/template-view/" + id
        );
        window.open(
          "unnati://shikshalokam.org/project-view/template-view/" + id,
          "_system"
        );
      },
      (no: boolean) => {
        // if (this.platform.is("ios")) {
        //   // app = unnati + "://";
        // } else if (this.platform.is("android")) {
        //   window.open(
        //     `https://play.google.com/store/apps/details?id=org.shikshalokam.${unnati}&hl=en`,
        //     "_system"
        //   );
        // }
        this.market.open("org.shikshalokam.unnati");
      }
    );
  }
}
