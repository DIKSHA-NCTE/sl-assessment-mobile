import { Component, ViewChild } from "@angular/core";
import {
  NavController,
  NavParams,
  AlertController,
  Events,
  Platform,
  PopoverController,
} from "ionic-angular";
import { LocalStorageProvider } from "../../providers/local-storage/local-storage";
import { AssessmentServiceProvider } from "../../providers/assessment-service/assessment-service";
import { UtilsProvider } from "../../providers/utils/utils";
import { EvidenceProvider } from "../../providers/evidence/evidence";
import { ApiProvider } from "../../providers/api/api";
import { AppConfigs } from "../../providers/appConfig";
import { TranslateService } from "@ngx-translate/core";
import { SubmissionListPage } from "../submission-list/submission-list";
import { ObservationServiceProvider } from "../../providers/observation-service/observation-service";
import { FileTransfer, FileTransferObject } from "@ionic-native/file-transfer";
import { DownloadAndPreviewProvider } from "../../providers/download-and-preview/download-and-preview";
import { ObservationReportsPage } from "../observation-reports/observation-reports";
import { ScoreReportMenusComponent } from "../../components/score-report-menus/score-report-menus";
declare var cordova: any;

@Component({
  selector: "page-observation-details",
  templateUrl: "observation-details.html",
})
export class ObservationDetailsPage {
  @ViewChild("entityComponent") childEntityList;

  observationDetails = [];
  programs: any;
  enableCompleteBtn: boolean;
  selectedObservationIndex: any;
  observationList: any;
  firstVisit = true;
  isIos: boolean;
  appFolderPath;
  search;
  submissionCount;

  showActionsheet: boolean = false;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCntrl: AlertController,
    private assessmentService: AssessmentServiceProvider,
    private utils: UtilsProvider,
    private evdnsServ: EvidenceProvider,
    private translate: TranslateService,
    private observationService: ObservationServiceProvider,
    private observationProvider: ObservationServiceProvider,
    private apiProvider: ApiProvider,
    private localStorage: LocalStorageProvider,
    private fileTransfr: FileTransfer,
    private platform: Platform,
    private popoverCtrl: PopoverController,
    private events: Events
  ) {
    this.events.subscribe("observationLocalstorageUpdated", (success) => {
      this.getLocalStorageData();
    });

    this.events.subscribe("refreshObservationListOnAddEntity", (type) => {
      this.refresh();
      console.log("refresh obs list");
    });
  }

  ionViewDidEnter() {
    this.selectedObservationIndex = this.navParams.get(
      "selectedObservationIndex"
    );

    console.log(
      "ionViewDidLoad ObservationDetailsPage",
      this.observationDetails
    );
    this.getLocalStorageData();
    this.isIos = this.platform.is("ios") ? true : false;
    this.appFolderPath = this.isIos
      ? cordova.file.documentsDirectory + "submissionDocs"
      : cordova.file.externalDataDirectory + "submissionDocs";
  }

  ionViewWillEnter() {
    console.log("On view enter");
    this.search = "";
    //  if(!this.firstVisit )
    // this.observationService.refreshObservationList(this.observationList).then( data =>{
    //   this.programs = data
    //   this.observationList = data;
    //   this.observationDetails[0]=data[this.selectedObservationIndex]
    // })
  }

  refresh(type = "normal") {
    console.log("refresh called");
    this.utils.startLoader();

    const url = AppConfigs.cro.observationList;
    this.observationProvider
      .refreshObservationList(this.observationList)
      .then((observationList) => {
        this.programs = observationList;
        this.observationList = observationList;
        this.observationDetails[0] =
          observationList[this.selectedObservationIndex];
        this.enableCompleteBtn = this.isAllEntitysCompleted();
        // console.log(JSON.stringify(observationList))
        this.utils.stopLoader();
      })
      .catch((error) => {
        this.utils.stopLoader();
      });

    // const url = AppConfigs.survey.fetchIndividualAssessments + "?type=assessment&subType=individual&status=active";
    // event ? "" : this.utils.startLoader();
    // this.apiProvider.httpGet(url, successData => {
    //   console.log(JSON.stringify(successData))
    //   console.log("previous data")
    //   console.log(JSON.stringify(this.observationList))

    //   const downloadedAssessments = []
    //   const copyOfObservationList = this.observationList;
    //   const currentObservation = successData.result;
    //   // if (type == "added") {
    //   //   copyOfObservationList.forEach(copyOfObservationListObs => {
    //   //     for (const observation of successData.result) {
    //   //       if (observation._id === copyOfObservationListObs._id)
    //   //         observation.forEach(copyOfObservationListEntity => {
    //   //           for (const entity of observation.entities) {
    //   //             if (copyOfObservationListEntity._id === entity._id)

    //   //               copyOfObservationList.submissions = entity.submissions
    //   //             copyOfObservationList.submissions.forEach(submission => {
    //   //               submission.downloaded = false
    //   //             })
    //   //           }
    //   //         });
    //   //     }
    //   //   });
    //   // }

    //   // for (const observation of this.observationList) {
    //   //   for (const entity of observation.entities) {

    //   //     for (const submission of entity.submissions) {
    //   //       if (submission.downloaded) {
    //   //         downloadedAssessments.push(submission._id);
    //   //       }
    //   //     }
    //   //   }

    //   // }
    //   for (const observation of this.observationList) {
    //       for (const entity of observation.entities) {
    //         if (entity.submissionId) {
    //           downloadedAssessments.push({
    //             id: entity._id,
    //             observationId: observation._id,
    //             submissionId: entity.submissionId
    //           });
    //         }
    //       }

    //     }

    //   if (!downloadedAssessments.length) {
    //     this.observationList = successData.result;
    //     this.localStorage.setLocalStorage('createdObservationList', successData.result);
    //     // event ? event.complete() : this.utils.stopLoader();
    //     console.log(JSON.stringify(this.observationList))
    //     this.observationList = [...successData.result]
    //     // this.observationDetails = [];
    //     this.observationDetails[0] = currentObservation[this.selectedObservationIndex];
    //     this.observationDetails = [...this.observationDetails]

    //   } else {
    //     downloadedAssessments.forEach(element => {

    //       for (const observation of successData.result) {
    //         if (observation._id === element.observationId) {
    //           for (const observation of successData.result) {
    //                   if (observation._id === element.observationId) {
    //                     for (const entity of observation.entities) {
    //                       if (element.id === entity._id) {
    //                         // entity.downloaded = true;
    //                         entity.submissionId = element.submissionId;

    //                       }
    //                     }
    //                   }
    //                 }
    //       }
    //     }
    //     });
    //     this.localStorage.setLocalStorage('createdObservationList', successData.result);
    //     this.observationList = [...successData.result]
    //     // this.observationDetails = [];
    //     // this.observationDetails.push(this.observationList[this.selectedObservationIndex]);
    //     console.log(JSON.stringify(this.observationDetails))
    //     this.observationDetails[0] = currentObservation[this.selectedObservationIndex];
    //     this.observationDetails = [...this.observationDetails]
    //     // event ? event.complete() : this.utils.stopLoader();

    //   }
    // }, error => {
    // });
  }

  getLocalStorageData() {
    this.observationDetails = [];
    this.localStorage
      .getLocalStorage("createdObservationList")
      .then((data) => {
        this.programs = data;
        this.observationList = data;
        this.observationDetails.push(data[this.selectedObservationIndex]);
        console.log(this.observationDetails);
        this.checkForAnySubmissionsMade();

        this.enableCompleteBtn = this.isAllEntitysCompleted();
        this.firstVisit = false;
      })
      .catch((error) => {
        this.firstVisit = false;
      });
  }

  isAllEntitysCompleted() {
    let completed = true;
    for (const entity of this.observationDetails[0]["entities"]) {
      if (entity.submissionStatus !== "completed") {
        return false;
      }
    }
    return completed;
  }

  markAsComplete() {
    let translateObject;
    this.translate
      .get([
        "actionSheet.confirm",
        "actionSheet.completeobservation",
        "actionSheet.restrictAction",
        "actionSheet.no",
        "actionSheet.yes",
      ])
      .subscribe((translations) => {
        translateObject = translations;
      });
    let alert = this.alertCntrl.create({
      title: translateObject["actionSheet.confirm"],
      message:
        translateObject["actionSheet.completeobservation"] +
        `<br>` +
        translateObject["actionSheet.restrictAction"],
      buttons: [
        {
          text: translateObject["actionSheet.no"],
          role: "cancel",
          handler: () => {},
        },
        {
          text: translateObject["actionSheet.yes"],
          handler: () => {
            console.log(
              this.programs[this.navParams.get("selectedObservationIndex")]._id
            );

            this.apiProvider.httpGet(
              AppConfigs.cro.markAsComplete +
                this.programs[this.navParams.get("selectedObservationIndex")]
                  ._id,
              (success) => {
                this.programs[
                  this.navParams.get("selectedObservationIndex")
                ].status = "completed";
                this.localStorage.setLocalStorage(
                  "createdObservationList",
                  this.programs
                );
                this.translate
                  .get("toastMessage.ok")
                  .subscribe((translations) => {
                    this.utils.openToast(success.message, translations);
                  });
                this.navCtrl.pop();
              },
              (error) => {}
            );
          },
        },
      ],
    });
    alert.present();
  }

  fileterList(event) {
    this.childEntityList.fileterList(event);
  }

  viewObservationReports() {
    const payload = {
      observationId: this.observationDetails[0]._id,
      entityType: this.observationDetails[0].entities[0].submissions[0]
        .entityType,
    };
    this.navCtrl.push(ObservationReportsPage, payload);
  }

  checkForAnySubmissionsMade() {
    const payload = {
      observationId: this.observationDetails[0]._id,
    };
    this.apiProvider.httpPost(
      AppConfigs.cro.observationSubmissionCount,
      payload,
      (success) => {
        this.submissionCount = success.data.noOfSubmissions;
      },
      (error) => {},
      { baseUrl: "dhiti" }
    );
  }

  // getAssessmentDetails(event) {
  //   // console.log("getting assessment details")
  //   event.observationIndex = this.navParams.get('selectedObservationIndex');
  //   // console.log(this.observationDetails[event.programIndex].entities[event.entityIndex].submissions.length)
  //   this.assessmentService.getAssessmentDetailsOfCreatedObservation(event, this.programs, 'createdObservationList').then(program => {
  //     this.programs = program;
  //     // console.log(JSON.stringify(program))

  //     this.goToEcm(this.navParams.get('selectedObservationIndex'), event, program)
  //   }).catch(error => {

  //   })
  // }

  // goToSubmissionListPage(observationIndex, entityIndex) {
  //   this.navCtrl.push(SubmissionListPage, { observationIndex: observationIndex, entityIndex: entityIndex, selectedObservationIndex: this.navParams.get('selectedObservationIndex') })
  // }

  // goToEcm(observationIndex, event, program) {
  //   console.log("Assesment details")
  //   let submissionId = program[observationIndex]['entities'][event.entityIndex].submissionId
  //   let heading = program[observationIndex]['entities'][event.entityIndex].name;
  //   if (this.observationDetails[event.programIndex].entities[event.entityIndex].submissions[0] && this.observationDetails[event.programIndex].entities[event.entityIndex].submissions.length > 0) {
  //     this.goToSubmissionListPage(event.programIndex, event.entityIndex)
  //   } else {
  //     // console.log(this.observationDetails[event.programIndex].entities[event.entityIndex].submissions.length)
  //     this.localStorage.getLocalStorage(this.utils.getAssessmentLocalStorageKey(submissionId)).then(successData => {
  //       // console.log(JSON.stringify(successData.assessment))
  //       if (successData.assessment.evidences.length > 1) {
  //         this.navCtrl.push('EvidenceListPage', { _id: submissionId, name: heading })
  //       } else {
  //         //   if (this.observationDetails[event.programIndex].entities[event.entityIndex].submissions.length > 0 ){
  //         //   this.goToSubmissionListPage(event.programIndex,event.entityIndex)
  //         // }else {
  //         if (successData.assessment.evidences[0].startTime) {
  //           this.utils.setCurrentimageFolderName(successData.assessment.evidences[0].externalId, submissionId)
  //           this.navCtrl.push('SectionListPage', { _id: submissionId, name: heading, selectedEvidence: 0 })
  //         } else {
  //           const assessment = { _id: submissionId, name: heading }
  //           this.openAction(assessment, successData, 0);
  //         }
  //       }
  //     }).catch(error => {
  //     });
  //   }

  // }
  openAction(assessment, aseessmemtData, evidenceIndex) {
    // console.log(JSON.stringify(assessment))

    this.utils.setCurrentimageFolderName(
      aseessmemtData.assessment.evidences[evidenceIndex].externalId,
      assessment._id
    );
    const options = {
      _id: assessment._id,
      name: assessment.name,
      selectedEvidence: evidenceIndex,
      entityDetails: aseessmemtData,
    };
    this.evdnsServ.openActionSheet(options, "Observation");
  }
  openObservationMenu($event) {
    let noScore: boolean = true;
    this.observationDetails.forEach((observation) => {
      console.log(observation.entities[0].submissions, "observation");
      observation.entities[0].submissions.forEach((submission) => {
        console.log(
          submission.ratingCompletedAt,
          "submission.ratingCompletedAt"
        );
        if (submission.ratingCompletedAt) {
          this.showActionsheet = true;
          noScore = false;
        }
      });
    });
    if (noScore) {
      this.viewObservationReports();
    } else {
      this.openMenu(event);
    }
  }

  // Menu for Submissions
  openMenu(event) {
    let payload = {
      observationId: this.observationDetails[0]._id,
    };
    let popover = this.popoverCtrl.create(ScoreReportMenusComponent, {
      observationDetail: payload,
      entityType: this.observationDetails[0].entities[0].submissions[0]
        .entityType,
      navigateToobservationReport: "true",
    });
    popover.present({ ev: event });
  }
}
