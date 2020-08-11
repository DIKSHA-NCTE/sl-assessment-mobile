import { Component, ViewChild } from "@angular/core";
import {
  NavController,
  NavParams,
  Events,
  ModalController,
  AlertController,
  PopoverController,
  App,
} from "ionic-angular";
import { LocalStorageProvider } from "../../../providers/local-storage/local-storage";
import { ApiProvider } from "../../../providers/api/api";
import { TranslateService } from "@ngx-translate/core";
import { UtilsProvider } from "../../../providers/utils/utils";
import { ProgramServiceProvider } from "../program-service";
import { ProgramObservationSubmissionPage } from "../program-observation-submission/program-observation-submission";
import { EntityListPage } from "../../observations/add-observation-form/entity-list/entity-list";
import { AppConfigs } from "../../../providers/appConfig";
import { ObservationReportsPage } from "../../observation-reports/observation-reports";
import { ScoreReportMenusComponent } from "../../../components/score-report-menus/score-report-menus";

/**
 * Generated class for the ProgramSolutionObservationDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: "page-program-solution-observation-detail",
  templateUrl: "program-solution-observation-detail.html",
})
export class ProgramSolutionObservationDetailPage {
  // programs: any;
  // @ViewChild("entityComponent") childEntityList;
  programIndex: any;
  solutionIndex: any;
  programs: any;
  selectedSolution: any;
  submissionCount: any;
  showActionsheet: boolean;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public localStorage: LocalStorageProvider,
    private modalCtrl: ModalController,
    private apiProviders: ApiProvider,
    private events: Events,
    private translate: TranslateService,
    public alertCntrl: AlertController,
    private utils: UtilsProvider,
    private programService: ProgramServiceProvider,
    private popoverCtrl: PopoverController,
    private app: App
  ) {
    // this.events.subscribe("observationLocalstorageUpdated", (success) => {
    //   this.getLocalStorageData();
    // });
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad ProgramSolutionEntityPage");
    this.programIndex = this.navParams.get("programIndex");
    this.solutionIndex = this.navParams.get("solutionIndex"); //selectedObservationIndex
  }

  ionViewWillEnter() {
    this.getLocalStorageData();
  }

  getLocalStorageData() {
    this.localStorage
      .getLocalStorage("programList")
      .then((data) => {
        this.programs = data;
        this.selectedSolution = data[this.programIndex].solutions[this.solutionIndex];
        this.checkForAnySubmissionsMade();
      })
      .catch((error) => {
        // this.firstVisit = false;
      });
  }

  goToObservationSubmission(entityIndex) {
    let data = {
      programIndex: this.programIndex,
      solutionIndex: this.solutionIndex,
      entityIndex: entityIndex,
    };
    if (
      this.selectedSolution.entities[entityIndex].submissions &&
      this.selectedSolution.entities[entityIndex].submissions.length
    ) {
      this.app.getRootNav().push(ProgramObservationSubmissionPage, { data });
    } else {
      let event = {
        programIndex: this.programIndex,
        solutionIndex: this.solutionIndex,
        entityIndex: entityIndex,
        submission: {
          submissionNumber: 1,
          observationId: this.selectedSolution._id,
        },
      };

      this.programService
        .getAssessmentDetailsForObservation(event, this.programs)
        .then(async (programs) => {
          this.utils.startLoader();
          await this.programService.refreshObservationList();
          await this.getLocalStorageData();
          this.utils.stopLoader();
          this.app.getRootNav().push(ProgramObservationSubmissionPage, { data });
        })
        .catch((err) => {});
    }
  }

  addEntity(...params) {
    // console.log(JSON.stringify(params))

    let entityListModal = this.modalCtrl.create(EntityListPage, {
      data: this.selectedSolution._id,
      solutionId: this.selectedSolution.solutionId,
    });
    entityListModal.onDidDismiss((entityList) => {
      if (entityList) {
        // console.log(JSON.stringify(entityList));
        let payload = {
          data: [],
        };
        entityList.forEach((element) => {
          payload.data.push(element._id);
        });
        // this.utils.startLoader();
        this.apiProviders.httpPost(
          AppConfigs.cro.mapEntityToObservation + this.selectedSolution._id,
          payload,
          async (success) => {
            await this.programService.refreshObservationList();

            this.getLocalStorageData();
            // this.utils.stopLoader();

            // entityList.forEach(entity => {
            //   entity.submissionStatus = "started";
            //   entity.downloaded = false;
            // })
            // this.entityList[0].entities = [...entityList, ...this.entityList[0].entities];
            // this.updatedLocalStorage.emit();
            console.log("refreshObservationListOnAddEntity getting called");
            this.events.publish("refreshObservationListOnAddEntity");
          },
          (error) => {
            // this.utils.stopLoader();
          }
        );
      }
    });
    entityListModal.present();
  }

  removeEntity(entityIndex) {
    console.log("remove entity called");
    let translateObject;
    this.translate
      .get(["actionSheet.confirm", "actionSheet.deleteEntity", "actionSheet.no", "actionSheet.yes"])
      .subscribe((translations) => {
        translateObject = translations;
        console.log(JSON.stringify(translations));
      });
    let alert = this.alertCntrl.create({
      title: translateObject["actionSheet.confirm"],
      message: translateObject["actionSheet.deleteEntity"],
      buttons: [
        {
          text: translateObject["actionSheet.no"],
          role: "cancel",
          handler: () => {},
        },
        {
          text: translateObject["actionSheet.yes"],
          handler: () => {
            let obj = {
              data: [this.selectedSolution.entities[entityIndex]._id],
            };
            this.utils.startLoader();
            this.apiProviders.httpPost(
              AppConfigs.cro.unMapEntityToObservation + this.selectedSolution._id,
              obj,
              async (success) => {
                let okMessage;
                this.translate.get("toastMessage.ok").subscribe((translations) => {
                  //  console.log(JSON.stringify(translations))

                  okMessage = translations;
                });
                this.utils.openToast(success.message);

                this.utils.stopLoader();
                console.log(JSON.stringify(success));

                // this.entityList[params[0]].entities.splice(params[1], 1);
                // this.refreshEvent.emit();
                // this.updatedLocalStorage.emit(params[1]);

                await this.programService.refreshObservationList();
                this.getLocalStorageData();
              },
              (error) => {
                this.utils.stopLoader();

                console.log(JSON.stringify(error));
                console.log("error");
              }
            );
            // console.log(JSON.stringify(this.entityList));
          },
        },
      ],
    });
    alert.present();
  }

  checkForAnySubmissionsMade() {
    const payload = {
      observationId: this.selectedSolution._id,
    };
    this.apiProviders.httpPost(
      AppConfigs.cro.observationSubmissionCount,
      payload,
      (success) => {
        this.submissionCount = success.data.noOfSubmissions;
      },
      (error) => {},
      { baseUrl: "dhiti" }
    );
  }

  openObservationMenu($event) {
    let noScore: boolean = true;
    // this.observationDetails.forEach((observation) => {
    //   console.log(observation.entities[0].submissions, "observation");
    //   observation.entities[0].submissions.forEach((submission) => {
    //     console.log(
    //       submission.ratingCompletedAt,
    //       "submission.ratingCompletedAt"
    //     );
    //     if (submission.ratingCompletedAt) {
    //       this.showActionsheet = true;
    //       noScore = false;
    //     }
    //   });
    // });
    this.selectedSolution.entities[0].submissions.map((submission) => {
      console.log(submission.ratingCompletedAt, "submission.ratingCompletedAt");
      if (submission.ratingCompletedAt) {
        this.showActionsheet = true;
        noScore = false;
      }
    });

    if (noScore) {
      this.viewObservationReports();
    } else {
      this.openMenu(event);
    }
  }

  viewObservationReports() {
    const payload = {
      observationId: this.selectedSolution._id,
      entityType: this.selectedSolution.entities[0].entityType,
    };
    this.navCtrl.push(ObservationReportsPage, payload);
  }

  // Menu for Submissions
  openMenu(event) {
    let payload = {
      observationId: this.selectedSolution._id,
    };
    let popover = this.popoverCtrl.create(ScoreReportMenusComponent, {
      observationDetail: payload,
      entityType: this.selectedSolution.entities[0].entityType,
      navigateToobservationReport: "true",
    });
    popover.present({ ev: event });
  }

  // fileterList(event) {
  //   this.childEntityList.fileterList(event);
  // }

  // getLocalStorageData() {
  //   this.observationDetails = [];
  //   this.localStorage
  //     .getLocalStorage("programList")
  //     .then((data) => {
  //       // this.programs = data;
  //       this.observationList = data[this.programIndex].solutions;
  //       this.observationDetails.push(
  //         data[this.programIndex].solutions[this.solutionIndex]
  //       );
  //       console.log(this.observationDetails);
  //       // this.checkForAnySubmissionsMade();
  //       // this.enableCompleteBtn = this.isAllEntitysCompleted();
  //       // this.firstVisit = false;
  //     })
  //     .catch((error) => {
  //       // this.firstVisit = false;
  //     });
  // }
}
