import { Component } from "@angular/core";
import { NavController, NavParams, App } from "ionic-angular";
import { LocalStorageProvider } from "../../../providers/local-storage/local-storage";
import { AssessmentServiceProvider } from "../../../providers/assessment-service/assessment-service";
import { ProgramServiceProvider } from "../program-service";
import { UtilsProvider } from "../../../providers/utils/utils";
import { EvidenceProvider } from "../../../providers/evidence/evidence";
import { storageKeys } from "../../../providers/storageKeys";
import { ProgramAssessmentSubmissionPage } from "../program-assessment-submission/program-assessment-submission";

/**
 * Generated class for the ProgramSolutionEntityPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: "page-program-solution-entity",
  templateUrl: "program-solution-entity.html",
})
export class ProgramSolutionEntityPage {
  program: any;
  solutionIndex: any;
  programIndex: any;
  programList: any;
  submissionArr: any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private localStorage: LocalStorageProvider,
    public assessmentService: AssessmentServiceProvider,
    public programService: ProgramServiceProvider,
    private utils: UtilsProvider,
    private evdnsServ: EvidenceProvider,
    private app: App
  ) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad ProgramSolutionEntityPage");
    this.programIndex = this.navParams.get("programIndex");
    this.solutionIndex = this.navParams.get("solutionIndex");

    this.getProgramFromStorage();
  }

  getProgramFromStorage() {
    this.utils.startLoader();
    this.localStorage
      .getLocalStorage(storageKeys.programList)
      .then((data) => {
        if (data) {
          this.program = data[this.programIndex];
          this.programList = data;
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

    this.programList[this.programIndex].solutions[this.solutionIndex].entities.map((e, entityIndex) => {
      if (!e.allowMultipleAssessemts) {
        this.submissionArr.includes(e.submissions[0]._id) ? (e.submissions[0].downloaded = true) : null;
      }
    });
  }

  getAssessmentDetails(entityIndex) {
    let event = {
      programIndex: this.programIndex,
      assessmentIndex: this.solutionIndex,
      entityIndex: entityIndex,
    };
    const assessmentType = this.programList[this.programIndex].solutions[this.solutionIndex].subType;
    this.programService
      .getAssessmentDetails(event, this.programList)
      .then(async (program) => {
        if (
          this.programList[this.programIndex].solutions[this.solutionIndex].entities[entityIndex].submissions.length
        ) {
          // this.getProgramFromStorage();
          this.program = program[this.programIndex];
          this.getSubmissionArr();
        } else {
          await this.programService.refreshObservationList();
          await this.getProgramFromStorage();
        }
      })
      .catch((error) => {});
  }

  goToEcm(id, EntityName, EntityId) {
    let submissionId = id;
    let heading = EntityName;
    let recentlyUpdatedEntity = {
      programName: this.program.name,
      ProgramId: this.program._id,
      EntityName: EntityName,
      EntityId: EntityId,
      submissionId: id,
    };
    console.log("go to ecm called" + submissionId);

    this.localStorage
      .getLocalStorage(this.utils.getAssessmentLocalStorageKey(submissionId))
      .then((successData) => {
        console.log(JSON.stringify(successData));
        if (successData.assessment.evidences.length > 1) {
          this.app.getRootNav().push("EvidenceListPage", {
            _id: submissionId,
            name: heading,
            recentlyUpdatedEntity: recentlyUpdatedEntity,
          });
        } else {
          if (successData.assessment.evidences[0].startTime) {
            this.utils.setCurrentimageFolderName(successData.assessment.evidences[0].externalId, submissionId);
            this.app.getRootNav().push("SectionListPage", {
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

  openMenu(event, entityIndex) {
    event = {
      event: event,
      programIndex: this.programIndex,
      assessmentIndex: this.solutionIndex,
      schoolIndex: entityIndex,
      entityIndex: entityIndex,
      submissionId: this.programList[this.programIndex].solutions[this.solutionIndex].entities[entityIndex]
        .submissions[0]._id,
      solutionId: this.programList[this.programIndex].solutions[this.solutionIndex]._id,
      parentEntityId: this.programList[this.programIndex].solutions[this.solutionIndex].entities[entityIndex]._id,
      createdByProgramId: this.programList[this.programIndex]._id,
    };
    console.log(event);
    this.programService.openMenu(event, this.programList, true);
  }

  goToAssessmentSubmission(entityIndex) {
    let navData = {
      programIndex: this.programIndex,
      solutionIndex: this.solutionIndex,
      entityIndex: entityIndex,
    };
    if (!this.programList[this.programIndex].solutions[this.solutionIndex].entities[entityIndex].submissions.length) {
      let event = {
        programIndex: this.programIndex,
        assessmentIndex: this.solutionIndex,
        entityIndex: entityIndex,
      };
      this.programService
        .getAssessmentDetails(event, this.programList)
        .then(async (programs) => {
          await this.programService.refreshObservationList();
          await this.getProgramFromStorage();
          this.app.getRootNav().push(ProgramAssessmentSubmissionPage, { navData });
        })
        .catch((err) => {});
    } else {
      this.app.getRootNav().push(ProgramAssessmentSubmissionPage, { navData });
    }
  }
}
