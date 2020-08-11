import { Component, ViewChild } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ModalController,
  PopoverController,
  AlertController,
  Content,
} from "ionic-angular";
import { LocalStorageProvider } from "../../../providers/local-storage/local-storage";
import { AssessmentServiceProvider } from "../../../providers/assessment-service/assessment-service";
import { ProgramServiceProvider } from "../program-service";
import { UtilsProvider } from "../../../providers/utils/utils";
import { EvidenceProvider } from "../../../providers/evidence/evidence";
import { storageKeys } from "../../../providers/storageKeys";
import { AppConfigs } from "../../../providers/appConfig";
import { ApiProvider } from "../../../providers/api/api";
import { ViewDetailComponent } from "../../../components/view-detail/view-detail";
import { SubmissionActionsComponent } from "../../../components/submission-actions/submission-actions";
import { TranslateService } from "@ngx-translate/core";
import { ObservationReportsPage } from "../../observation-reports/observation-reports";
import { DashboardPage } from "../../dashboard/dashboard";

/**
 * Generated class for the ProgramAssessmentSubmissionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: "page-program-assessment-submission",
  templateUrl: "program-assessment-submission.html",
})
export class ProgramAssessmentSubmissionPage {
  programIndex: any;
  solutionIndex: any;
  entityIndex: any;
  program: any;
  programList: any;
  submissionArr: any;
  submissionList: any;
  @ViewChild(Content) pageTop: Content;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private localStorage: LocalStorageProvider,
    public assessmentService: AssessmentServiceProvider,
    public programService: ProgramServiceProvider,
    private utils: UtilsProvider,
    private evdnsServ: EvidenceProvider,
    private apiProvider: ApiProvider,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private translate: TranslateService,
    private alertCntrl: AlertController
  ) {}

  ionViewDidEnter() {
    console.log("ionViewDidLoad ProgramAssessmentSubmissionPage");
    let navData = this.navParams.get("navData");
    this.programIndex = navData.programIndex;
    this.solutionIndex = navData.solutionIndex;
    this.entityIndex = navData.entityIndex;
    this.getProgramFromStorage();
  }

  getProgramFromStorage(stopLoader?) {
    stopLoader ? null : this.utils.startLoader();
    this.localStorage
      .getLocalStorage(storageKeys.programList)
      .then((data) => {
        if (data) {
          this.programList = data;
          this.program = data[this.programIndex];
          this.submissionList =
            data[this.programIndex].solutions[this.solutionIndex].entities[this.entityIndex].submissions;
          this.getSubmissionArr();
        } else {
          this.program = null;
        }
        this.utils.stopLoader();
      })
      .catch((error) => {
        this.utils.stopLoader();
        this.program = null;
      });
  }

  getSubmissionArr() {
    this.localStorage
      .getLocalStorage(storageKeys.submissionIdArray)
      .then((allId) => {
        // return allId.includes(submissionId);
        this.submissionArr = allId;
        this.applySubmission();
      })
      .catch((err) => {
        // this.getAssessmentDetails(entityIndex);
        // return false;
      });
  }

  applySubmission() {
    // this.program.solutions[this.solutionIndex].

    let solutionId = this.programList[this.programIndex].solutions[this.solutionIndex]._id;
    this.submissionList.map((s) => {
      this.submissionArr.includes(s._id) ? (s.downloaded = true) : null;
    });
  }

  getAssessmentDetails(submissionNumber) {
    console.log("details");
    let event = {
      programIndex: this.programIndex,
      assessmentIndex: this.solutionIndex,
      entityIndex: this.entityIndex,
      submissionNumber: submissionNumber,
    };
    // const assessmentType = this.programList[this.programIndex].solutions[
    //   this.solutionIndex
    // ].subType;
    this.programService
      .getAssessmentDetails(event, this.programList)
      .then((program) => {
        // this.program = program[this.programIndex];
        // this.getSubmissionArr();
        this.getProgramFromStorage();
      })
      .catch((error) => {});
  }
  goToEcm(id) {
    let submissionId = id;
    let heading = this.program.solutions[this.solutionIndex].entities[this.entityIndex].name;
    let recentlyUpdatedEntity = {
      programName: this.program.name,
      ProgramId: this.program._id,
      EntityName: this.program.solutions[this.solutionIndex].entities[this.entityIndex].name,
      EntityId: this.program.solutions[this.solutionIndex].entities[this.entityIndex]._id,
      submissionId: id,
    };
    console.log("go to ecm called" + submissionId);

    this.localStorage
      .getLocalStorage(this.utils.getAssessmentLocalStorageKey(submissionId))
      .then((successData) => {
        console.log(JSON.stringify(successData));
        if (successData.assessment.evidences.length > 1) {
          this.navCtrl.push("EvidenceListPage", {
            _id: submissionId,
            name: heading,
            recentlyUpdatedEntity: recentlyUpdatedEntity,
          });
        } else {
          if (successData.assessment.evidences[0].startTime) {
            this.utils.setCurrentimageFolderName(successData.assessment.evidences[0].externalId, submissionId);
            this.navCtrl.push("SectionListPage", {
              _id: submissionId,
              name: heading,
              selectedEvidence: 0,
              recentlyUpdatedEntity: recentlyUpdatedEntity,
            });
          } else {
            const assessment = {
              _id: submissionId,
              name: heading,
              recentlyUpdatedEntity: recentlyUpdatedEntity,
            };
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
      recentlyUpdatedEntity: assessment.recentlyUpdatedEntity,
      selectedEvidence: evidenceIndex,
      entityDetails: aseessmemtData,
    };
    this.evdnsServ.openActionSheet(options);
  }

  observeAgain() {
    this.utils.startLoader("Creating an Assessment");

    const entityId = this.program.solutions[this.solutionIndex].entities[this.entityIndex]._id;
    const solutionId = this.program.solutions[this.solutionIndex]._id;

    this.apiProvider.httpGet(
      AppConfigs.assessmentsList.assessAgain + solutionId + "?entityId=" + entityId,

      (success) => {
        console.log(success);
        this.refreshLocalObservationList();
      },
      (error) => {
        this.utils.stopLoader();
      }
    );
  }
  //open info menu
  openInfo(submission) {
    submission.entityName = this.program.solutions[this.solutionIndex].entities[this.entityIndex].name;
    const modal = this.modalCtrl.create(ViewDetailComponent, {
      submission: submission,
    });
    modal.present();
  }

  openActionMenu(event, submission, index) {
    submission.entityName = this.program.solutions[this.solutionIndex].entities[this.entityIndex].name;
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

  ediSubmissionName(data, i) {
    const payload = {
      title: data.title,
    };
    this.utils.startLoader();
    this.apiProvider.httpPost(
      AppConfigs.assessmentsList.editAssessment + data.submissionId,
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
              AppConfigs.assessmentsList.deleteAssessment + submissionId,
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

  refreshLocalObservationList(refreshEvent?) {
    this.programService
      .refreshObservationList(this.programList, event)
      .then(async (data) => {
        // this.utils.stopLoader();
        await this.getProgramFromStorage("stopLoader");
        if (refreshEvent) refreshEvent.complete();
        this.program.solutions[this.solutionIndex].entities[this.entityIndex].submissions.length > 0
          ? null
          : this.navCtrl.pop();
        this.pageTop.scrollToTop();
      })
      .catch((error) => {
        this.utils.stopLoader();
      });
  }

  viewReports(submissionId?) {
    let payload = {
      entity: this.program.solutions[this.solutionIndex].entities[this.entityIndex],
      programId: this.program._id,
      entityType: this.program.solutions[this.solutionIndex].entities[this.entityIndex].entityType,
      solutionId: this.program.solutions[this.solutionIndex]._id,

      solutionName: this.program.solutions[this.solutionIndex].name,
    };
    submissionId
      ? Object.assign(payload, { submissionId: submissionId })
      : Object.assign(payload, { multiAssessmentsReport: true });

    this.navCtrl.push(DashboardPage, payload);
  }

  doInfinite(infiniteScroll) {
    let solutionId = this.programList[this.programIndex].solutions[this.solutionIndex]._id;
    let entityId = this.program.solutions[this.solutionIndex].entities[this.entityIndex]._id;
    this.programService
      .submissionListAll(solutionId, entityId)
      .then((list) => {
        this.submissionList = list;
        this.applySubmission();
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
