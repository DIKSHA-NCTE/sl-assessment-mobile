import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  App,
  Events,
  AlertController,
  PopoverController,
} from "ionic-angular";
import { LocalStorageProvider } from "../../providers/local-storage/local-storage";
import { AssessmentServiceProvider } from "../../providers/assessment-service/assessment-service";
import { AppConfigs } from "../../providers/appConfig";
import { AddObservationFormPage } from "./add-observation-form/add-observation-form";
import { ActionSheetController } from "ionic-angular";
import { ObservationDetailsPage } from "../observation-details/observation-details";
import { ApiProvider } from "../../providers/api/api";
import { UtilsProvider } from "../../providers/utils/utils";
import { TranslateService } from "@ngx-translate/core";
import { GenericMenuPopOverComponent } from "../../components/generic-menu-pop-over/generic-menu-pop-over";
import { ObservationProvider } from "../../providers/observation/observation";
import { ObservationServiceProvider } from "../../providers/observation-service/observation-service";

@IonicPage()
@Component({
  selector: "page-observations",
  templateUrl: "observations.html",
})
export class ObservationsPage {
  selectedTab;
  draftObservation;
  createdObservation: any;
  draftListLength: Number = 0;
  activeListLength: number = 0;
  completeListLength: number = 0;
  observationSubscription;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private observationProvider: ObservationServiceProvider,
    public app: App,
    public utils: UtilsProvider,
    public alertCntrl: AlertController,
    private localStorage: LocalStorageProvider,
    private assessmentService: AssessmentServiceProvider,
    private apiProviders: ApiProvider,
    private translate: TranslateService,
    private popoverCtrl: PopoverController,
    private events: Events,
    public actionSheetCtrl: ActionSheetController,
    private observationService: ObservationProvider
  ) {
    this.events.subscribe("draftObservationArrayReload", () => {
      this.getDraftObservation();
    });

    this.observationSubscription = this.observationService.observationListUpdate.subscribe(
      (success) => {
        this.utils.startLoader();
        this.getCreatedObservation();
      },
      (error) => {}
    );
  }

  ionViewDidLoad() {
    this.selectedTab = "active";
    // console.log("observation Module loaded");
  }

  ionViewWillLeave() {
    this.observationSubscription
      ? this.observationSubscription.unsubscribe()
      : null;
  }

  getFromLocal() {
    this.utils.startLoader();

    this.localStorage
      .getLocalStorage("createdObservationList")
      .then((data) => {
        if (data) {
          this.createdObservation = [...data];
          this.refresh();
          this.countCompleteActive();
          this.utils.stopLoader();
        } else {
          this.getCreatedObservation();
        }
      })
      .catch((error) => {
        this.getCreatedObservation();
      });
  }

  ionViewDidEnter() {
    this.getDraftObservation();
    this.getFromLocal();
  }

  onTabChange(tabName) {
    this.selectedTab = tabName;
    if (tabName === "draft") {
      this.getDraftObservation();
    }
  }

  programs: any;
  enableRefresh = AppConfigs.configuration.enableAssessmentListRefresh;

  getCreatedObservation() {
    console.log("created oservation api called");
    // this.utils.startLoader();
    this.apiProviders.httpGet(
      AppConfigs.cro.observationList,
      (success) => {
        this.createdObservation = success.result;
        this.createdObservation.forEach((element) => {
          if (element.entities.length >= 0) {
            element.entities.forEach((entity) => {
              // entity.downloaded = false;
              if (entity.submissions && entity.submissions.length > 0) {
                entity.submissions.forEach((submission) => {
                  submission["downloaded"] = false;
                });
              }
            });
          }
        });
        console.log(JSON.stringify(this.createdObservation));
        this.utils.stopLoader();
        this.localStorage.setLocalStorage(
          "createdObservationList",
          this.createdObservation
        );
        this.countCompleteActive();
      },
      (error) => {
        this.utils.stopLoader();
      },
      { version: "v2" }
    );
  }
  countCompleteActive() {
    this.completeListLength = 0;
    this.activeListLength = 0;
    this.createdObservation.forEach((element) => {
      // console.log(element.status)
      element.status === "completed"
        ? (this.completeListLength = this.completeListLength + 1)
        : (this.activeListLength = this.activeListLength + 1);
    });
    // console.log(this.activeListLength + "        " + this.completeListLength)
  }
  // navigateToDetails(index) {
  //   this.navCtrl.push(ObservationDetailsPage, {selectedObservationIndex: index , typeOfObservation : "observationList"})
  // }
  navigateToCreatedObservationDetails(index) {
    this.navCtrl.push(ObservationDetailsPage, {
      selectedObservationIndex: index,
    });
  }

  refresh(event?: any) {
    event ? this.utils.startLoader() : "";
    this.observationProvider
      .refreshObservationList(this.createdObservation, event)
      .then((observationList) => {
        this.createdObservation = observationList;
        // console.log(JSON.stringify(observationList))
        event ? this.utils.stopLoader() : "";
      })
      .catch(() => {
        event ? this.utils.stopLoader() : "";
      });

    // const url = AppConfigs.cro.observationList;
    // const url = AppConfigs.survey.fetchIndividualAssessments + "?type=assessment&subType=individual&status=active";
    // event ? "" : this.utils.startLoader();
    // this.apiProviders.httpGet(url, successData => {
    // console.log(JSON.stringify(this.createdObservation))
    // const downloadedAssessments = []
    // const currentObservation = successData.result;
    // for (const observation of this.createdObservation) {
    //   for (const entity of observation.entities) {
    //     if (entity.submissionId) {
    //       downloadedAssessments.push({
    //         id: entity._id,
    //         observationId: observation._id,
    //         submissionId: entity.submissionId
    //       });
    //     }
    //   }

    // }

    // if (!downloadedAssessments.length) {
    //   this.createdObservation = successData.result;
    //   this.localStorage.setLocalStorage('createdObservationList', successData.result);
    //   event ? event.complete() : this.utils.stopLoader();

    // } else {
    //   downloadedAssessments.forEach(element => {

    //     for (const observation of successData.result) {
    //       if (observation._id === element.observationId) {
    //         for (const entity of observation.entities) {
    //           if (element.id === entity._id) {
    //             // entity.downloaded = true;
    //             entity.submissionId = element.submissionId;

    //           }
    //         }
    //       }
    //     }
    //   });
    //   this.localStorage.setLocalStorage('createdObservationList', successData.result);
    //   this.createdObservation = successData.result;
    //   event ? event.complete() : this.utils.stopLoader();

    // }
    this.countCompleteActive();

    // }, error => {
    // });
  }

  getDraftObservation() {
    this.localStorage
      .getLocalStorage("draftObservation")
      .then((draftObs) => {
        this.draftObservation = draftObs;
        // console.log("Draft observation");
        // console.log(JSON.stringify(draftObs))
        this.draftListLength = this.draftObservation.length;
        // this.countCompleteActive();
      })
      .catch(() => {
        this.draftObservation = [];
      });
  }

  addObservation() {
    this.app.getRootNav().push(AddObservationFormPage, {});
  }

  getAssessmentDetails(event) {
    this.assessmentService
      .getAssessmentDetails(event, this.programs, "observation")
      .then((program) => {
        this.programs = program;
      })
      .catch((error) => {});
  }

  openMenu(event, index) {
    // this.assessmentService.openMenu(event, this.programs, false);
    let popover = this.popoverCtrl.create(GenericMenuPopOverComponent, {
      isObservation: true,
      showAbout: true,
      showEdit: true,
      assessmentIndex: index,
      assessmentName: "createdObservationList",
    });

    popover.present({ ev: event });
  }

  actionOnDraftObservation(index, observation) {
    let translateObject;
    this.translate
      .get([
        "actionSheet.edit",
        "actionSheet.chooseAction",
        "actionSheet.delete",
        "actionSheet.confirm",
        "actionSheet.deleteObservation",
        "actionSheet.yes",
        "actionSheet.no",
        "actionSheet.publish",
      ])
      .subscribe((translations) => {
        translateObject = translations;
        // console.log(JSON.stringify(translations))
      });
    let actionArray = [
      {
        text: translateObject["actionSheet.edit"],
        role: "edit",
        icon: "create",

        handler: () => {
          console.log("edit clicked");
          this.app
            .getRootNav()
            .push(AddObservationFormPage, { data: observation, index: index });
        },
      },
      {
        text: translateObject["actionSheet.delete"],
        cssClass: "deleteIcon",
        icon: "trash",
        handler: () => {
          let alert = this.alertCntrl.create({
            title: translateObject["actionSheet.confirm"],
            message: translateObject["actionSheet.deleteObservation"],
            buttons: [
              {
                text: translateObject["actionSheet.no"],
                role: "cancel",
                handler: () => {},
              },
              {
                text: translateObject["actionSheet.yes"],
                handler: () => {
                  this.draftObservation.splice(index, 1);
                  this.localStorage.setLocalStorage(
                    "draftObservation",
                    this.draftObservation
                  );
                  this.getDraftObservation();
                },
              },
            ],
          });
          alert.present();
        },
      },
    ];
    if (observation.data.isComplete) {
      actionArray.splice(0, 0, {
        text: translateObject["actionSheet.publish"],
        role: "Publish",
        icon: "add",

        handler: () => {
          let obj: {} = {
            data: {},
          };
          // console.log(JSON.stringify(observation))
          obj["data"].status = "published";
          obj["data"].startDate = observation.data.startDate;
          obj["data"].endDate = observation.data.endDate;
          obj["data"].name = observation.data.name;
          obj["data"].description = observation.data.description;
          obj["data"].entities = observation.data.entities;

          // console.log(JSON.stringify(obj));

          // observation.data.status = 'published';

          this.apiProviders.httpPost(
            AppConfigs.cro.createObservation + observation.data.solutionId,
            obj,
            (success) => {
              // console.log(JSON.stringify(success));
              // console.log("published obs")
              this.translate
                .get("toastMessage.ok")
                .subscribe((translations) => {
                  this.utils.openToast(success.message, translations);
                });
              this.refresh();
              this.getDraftObservation();
              this.selectedTab = "active";
            },
            (error) => {}
          );
          // let publishObservation = observation;
          this.draftObservation.splice(index, 1);
          this.localStorage.setLocalStorage(
            "draftObservation",
            this.draftObservation
          );
        },
      });
    }
    const actionSheet = this.actionSheetCtrl.create({
      title: translateObject["actionSheet.chooseAction"],
      cssClass: "action-sheets-groups-page",
      buttons: actionArray,
    });
    actionSheet.present();
  }
}
