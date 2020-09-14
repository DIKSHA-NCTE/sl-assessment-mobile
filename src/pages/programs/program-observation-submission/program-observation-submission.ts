import { Component, ViewChild } from "@angular/core";
import {
  NavController,
  NavParams,
  ModalController,
  PopoverController,
  AlertController,
  Events,
  Content,
} from "ionic-angular";
import { UtilsProvider } from "../../../providers/utils/utils";
import { LocalStorageProvider } from "../../../providers/local-storage/local-storage";
import { storageKeys } from "../../../providers/storageKeys";
import { ViewDetailComponent } from "../../../components/view-detail/view-detail";
import { ScoreReportMenusComponent } from "../../../components/score-report-menus/score-report-menus";
import { ObservationReportsPage } from "../../observation-reports/observation-reports";
import { SubmissionActionsComponent } from "../../../components/submission-actions/submission-actions";
import { TranslateService } from "@ngx-translate/core";
import { ApiProvider } from "../../../providers/api/api";
import { AppConfigs } from "../../../providers/appConfig";
import { ProgramServiceProvider } from "../program-service";
import { EvidenceProvider } from "../../../providers/evidence/evidence";

/**
 * Generated class for the ProgramObservationSubmissionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: "page-program-observation-submission",
  templateUrl: "program-observation-submission.html",
})
export class ProgramObservationSubmissionPage {
  programIndex: any;
  solutionIndex: any;
  entityIndex: any;
  submissionList: any;
  inProgressObservations = [];
  completedObservations = [];
  submissions: any[];
  currentTab = "all";
  height: number;
  selectedSolution: any;
  showEntityActionsheet: boolean;
  showActionsheet: boolean;
  programList: any;
  recentlyUpdatedEntity: {
    programName: any;
    ProgramId: any;
    EntityName: any;
    EntityId: any;
    isObservation: boolean;
  };
  submissionIdArr: any;
  @ViewChild(Content) pageTop: Content;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private utils: UtilsProvider,
    private localStorage: LocalStorageProvider,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private translate: TranslateService,
    private alertCntrl: AlertController,
    private apiProvider: ApiProvider,
    private programService: ProgramServiceProvider,
    private evdnsServ: EvidenceProvider,
    private events: Events
  ) {}

  ionViewDidEnter() {
    console.log("ionViewDidLoad ProgramObservationSubmissionPage");
    let data = this.navParams.get("data");
    this.programIndex = data.programIndex;
    this.solutionIndex = data.solutionIndex;
    this.entityIndex = data.entityIndex;
    this.getProgramFromStorage();
  }

  async getProgramFromStorage(stopLoader?, noLoader?) {
    await this.localStorage
      .getLocalStorage(storageKeys.observationSubmissionIdArr)
      .then((ids) => {
        this.submissionIdArr = ids;
      })
      .catch((err) => {
        this.submissionIdArr = [];
      });

    stopLoader ? null : noLoader ? null : this.utils.startLoader();

    await this.localStorage
      .getLocalStorage(storageKeys.programList)
      .then((data) => {
        if (data) {
          this.programList = data;
          this.selectedSolution = this.programList[this.programIndex].solutions[this.solutionIndex];
          this.submissionList = this.programList[this.programIndex].solutions[this.solutionIndex].entities[
            this.entityIndex
          ].submissions;
          this.applyDownloadedflag();

          this.splitCompletedAndInprogressObservations();
          this.recentlyUpdatedEntityFn();

          this.tabChange(this.currentTab ? this.currentTab : "all");
        } else {
          this.submissionList = null;
        }
        noLoader ? null : this.utils.stopLoader();
      })
      .catch((error) => {
        noLoader ? null : this.utils.stopLoader();
        this.submissionList = null;
      });
  }

  applyDownloadedflag() {
    this.submissionList.map((s) => {
      this.submissionIdArr.includes(s._id) ? (s.downloaded = true) : null;
    });
  }

  recentlyUpdatedEntityFn() {
    this.recentlyUpdatedEntity = {
      programName: this.selectedSolution.programId,
      ProgramId: this.selectedSolution.programId,
      EntityName: this.selectedSolution.entities[this.entityIndex].name,
      EntityId: this.selectedSolution.entities[this.entityIndex]._id,
      isObservation: true,
    };
  }

  splitCompletedAndInprogressObservations() {
    this.completedObservations = [];
    this.inProgressObservations = [];
    for (const submission of this.submissionList) {
      submission.status === "completed"
        ? this.completedObservations.push(submission)
        : this.inProgressObservations.push(submission);
    }
  }

  tabChange(value) {
    this.height = 100;
    this.submissions = [];
    this.currentTab = value;
    switch (value) {
      case "inProgress":
        this.submissions = this.inProgressObservations;

        break;
      case "completed":
        this.submissions = this.completedObservations;
        break;
      case "all":
        this.submissions = this.submissions.concat(this.inProgressObservations, this.completedObservations);
        break;
      default:
        this.submissions = this.submissions.concat(this.inProgressObservations, this.completedObservations);
        console.log(this.submissions);
    }
  }

  //open info menu
  openInfo(submission) {
    submission.entityName = this.selectedSolution.entities[this.entityIndex].name;
    const modal = this.modalCtrl.create(ViewDetailComponent, {
      submission: submission,
    });
    modal.present();
  }

  // Menu for Submissions
  openMenu(event, submission, index) {
    if (submission.ratingCompletedAt) {
      let popover = this.popoverCtrl.create(ScoreReportMenusComponent, {
        submission: submission,
        entityType: this.selectedSolution.entities[this.entityIndex].entityType,
        // showEntityActionsheet:"false",
        // showSubmissionAction:'true'
      });
      popover.present({ ev: event });
    } else {
      this.navCtrl.push(ObservationReportsPage, {
        submissionId: submission._id,
        entityType: this.selectedSolution.entities[this.entityIndex].entityType,
      });
    }
  } //  entity actions
  entityActions(e) {
    let noScore: boolean = true;
    this.submissions.forEach((submission) => {
      submission.showActionsheet = false;
      if (submission.ratingCompletedAt) {
        // this.showActionsheet = true;
        // this.showEntityActionsheet = true;
        noScore = false;
      }
    });
    if (noScore) {
      this.viewEntityReports();
    } else {
      this.openEntityReportMenu(e);
    }
  }

  // Menu for Entity reports
  openEntityReportMenu(event) {
    let popover = this.popoverCtrl.create(ScoreReportMenusComponent, {
      observationId: this.selectedSolution.entities[this.entityIndex].submissions[0].observationId,
      entityId: this.selectedSolution.entities[this.entityIndex]._id,

      entityType: this.selectedSolution.entities[this.entityIndex].entityType,
      showEntityActionsheet: "true",
      showSubmissionAction: "false",
    });
    popover.present({ ev: event });
  }

  viewEntityReports() {
    this.showEntityActionsheet = false;
    this.showActionsheet = false;
    const payload = {
      entityId: this.selectedSolution.entities[this.entityIndex]._id,
      observationId: this.selectedSolution.entities[this.entityIndex].submissions[0].observationId,
      entityType: this.selectedSolution.entities[this.entityIndex].entityType,
    };
    this.navCtrl.push(ObservationReportsPage, payload);
  }

  // Actions on submissions
  openActionMenu(event, submission, index) {
    submission.entityName = this.selectedSolution.entities[this.entityIndex].name;
    let popover = this.popoverCtrl.create(SubmissionActionsComponent, {
      submission: submission,
    });
    popover.onDidDismiss((data) => {
      if (data && data.action === "update") {
        const payload = {
          submissionId: submission._id,
          title: data.name,
        };
        this.ediSubmissionName(payload, index);
      } else if (data && data.action === "delete") {
        this.deleteSubmission(submission._id);
      }
    });
    popover.present({ ev: event });
  }

  deleteSubmission(submissionId) {
    let translateObject;
    this.translate
      .get(["actionSheet.confirm", "actionSheet.deleteSubmission", "actionSheet.no", "actionSheet.yes"])
      .subscribe((translations) => {
        translateObject = translations;
      });
    let alert = this.alertCntrl.create({
      title: translateObject["actionSheet.confirm"],
      message: translateObject["actionSheet.deleteSubmission"],
      buttons: [
        {
          text: translateObject["actionSheet.no"],
          role: "cancel",
          handler: () => {},
        },
        {
          text: translateObject["actionSheet.yes"],
          handler: () => {
            this.utils.startLoader();
            this.apiProvider.httpGet(
              AppConfigs.cro.obsrvationSubmissionDelete + submissionId,
              (success) => {
                console.log(success);
                this.refreshLocalObservationList();
              },
              (error) => {
                this.utils.stopLoader();
              }
            );
          },
        },
      ],
    });
    alert.present();
  }

  ediSubmissionName(data, i) {
    const payload = {
      title: data.title,
    };
    this.utils.startLoader();
    this.apiProvider.httpPost(
      AppConfigs.cro.editObservationName + data.submissionId,
      payload,
      (success) => {
        console.log(success);
        this.refreshLocalObservationList();
      },
      (error) => {
        this.utils.stopLoader();
      }
    );
  }
  observeAgain() {
    this.utils.startLoader("Creating an Observation");
    // let submissionNumber =
    //   this.submissionList[this.submissionList.length - 1].submissionNumber + 1;

    const entityId = this.selectedSolution.entities[this.entityIndex]._id;
    // const observationId = this.selectedSolution.entities[this.entityIndex].submissions[0].observationId;
    const observationId = this.selectedSolution._id;

    this.apiProvider.httpPost(
      AppConfigs.cro.observationSubmissionCreate + observationId + "?entityId=" + entityId,
      {},
      (success) => {
        console.log(success);
        this.refreshLocalObservationList();
      },
      (error) => {
        this.utils.stopLoader();
      }
    );
  }

  getAssessmentDetails(submission) {
    this.showActionsheet = false;
    this.showEntityActionsheet = false;

    this.localStorage
      .getLocalStorage(this.utils.getAssessmentLocalStorageKey(submission._id))
      .then((data) => {
        if (!data) {
          this.getAssessmentDetailsApi(submission);
        } else {
          this.goToEcm(submission);
        }
      })
      .catch((error) => {
        this.getAssessmentDetailsApi(submission);
      });
  }

  getAssessmentDetailsApi(submission) {
    let event = {
      programIndex: this.programIndex,
      solutionIndex: this.solutionIndex,
      entityIndex: this.entityIndex,
      submission: submission,
    };

    this.programService
      .getAssessmentDetailsForObservation(event, this.programList)
      .then(async (programList) => {
        await this.getProgramFromStorage();
        this.goToEcm(submission);
      })
      .catch((error) => {});
  }

  goToEcm(submission) {
    let submissionId = submission._id;
    let heading = this.selectedSolution.entities[this.entityIndex].name;

    this.localStorage
      .getLocalStorage(this.utils.getAssessmentLocalStorageKey(submissionId))
      .then((successData) => {
        if (successData.assessment.evidences.length > 1) {
          this.navCtrl.push("EvidenceListPage", {
            _id: submissionId,
            name: heading,
            recentlyUpdatedEntity: this.recentlyUpdatedEntity,
          });
        } else {
          if (successData.assessment.evidences[0].startTime) {
            this.utils.setCurrentimageFolderName(successData.assessment.evidences[0].externalId, submissionId);
            this.navCtrl.push("SectionListPage", {
              _id: submissionId,
              name: heading,
              selectedEvidence: 0,
              recentlyUpdatedEntity: this.recentlyUpdatedEntity,
            });
          } else {
            const assessment = { _id: submissionId, name: heading };
            this.openAction(assessment, successData, 0);
          }
        }
      })
      .catch((error) => {});
  }

  openAction(assessment, aseessmemtData, evidenceIndex) {
    this.utils.setCurrentimageFolderName(aseessmemtData.assessment.evidences[evidenceIndex].externalId, assessment._id);
    const options = {
      _id: assessment._id,
      name: assessment.name,
      selectedEvidence: evidenceIndex,
      entityDetails: aseessmemtData,
      recentlyUpdatedEntity: this.recentlyUpdatedEntity,
    };
    console.log(JSON.stringify(options));
    this.evdnsServ.openActionSheet(options, "Observation");
  }

  refreshLocalObservationList(refreshEvent?, startLoader?) {
    let event = {
      programIndex: this.programIndex,
      solutionIndex: this.solutionIndex,
      entityIndex: this.entityIndex,
    };
    startLoader ? this.utils.startLoader() : null;

    this.programService
      .refreshObservationList(this.programList, event)
      .then(async (data) => {
        // this.utils.stopLoader();
        await this.getProgramFromStorage("stopLoader");
        if (refreshEvent) refreshEvent.complete();
        this.selectedSolution.entities[this.entityIndex].submissions.length > 0 ? null : this.navCtrl.pop();

        this.pageTop.scrollToTop();
      })
      .catch((error) => {
        this.utils.stopLoader();
      });
  }

  doInfinite(infiniteScroll) {
    let observationId = this.programList[this.programIndex].solutions[this.solutionIndex]._id;
    let entityId = this.programList[this.programIndex].solutions[this.solutionIndex].entities[this.entityIndex]._id;
    this.programService
      .submissionListAllObs(observationId, entityId)
      .then((list) => {
        this.submissionList = list;
        this.splitCompletedAndInprogressObservations();
        this.tabChange(this.currentTab ? this.currentTab : "all");

        this.recentlyUpdatedEntityFn();
        console.log(list);
      })
      .then(() => {
        infiniteScroll.complete();
      })
      .catch((err) => {
        infiniteScroll.complete();
      });
  }
}
