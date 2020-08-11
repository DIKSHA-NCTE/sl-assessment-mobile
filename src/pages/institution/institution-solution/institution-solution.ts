import { Component } from "@angular/core";
import { NavController, NavParams, App } from "ionic-angular";
import { LocalStorageProvider } from "../../../providers/local-storage/local-storage";
import { UtilsProvider } from "../../../providers/utils/utils";
import { EvidenceProvider } from "../../../providers/evidence/evidence";
import { InstitutionServiceProvider } from "../institution-service";
import { storageKeys } from "../../../providers/storageKeys";
import { ProgramObservationSubmissionPage } from "../../programs/program-observation-submission/program-observation-submission";
import { ProgramServiceProvider } from "../../programs/program-service";
import { ProgramAssessmentSubmissionPage } from "../../programs/program-assessment-submission/program-assessment-submission";

/**
 * Generated class for the InstitutionSolutionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: "page-institution-solution",
  templateUrl: "institution-solution.html",
})
export class InstitutionSolutionPage {
  entity: any;
  entityType: any;
  entityIndex: any;
  institutionList: any;
  submissionArr: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public localStorage: LocalStorageProvider,
    public utils: UtilsProvider,
    public evdnsServ: EvidenceProvider,
    public institutionService: InstitutionServiceProvider,
    public programService: ProgramServiceProvider,
    public appCtrl: App
  ) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad InstitutionSolutionPage");
    let navData = this.navParams.get("navData");
    this.entityType = navData.entityType;
    this.entityIndex = navData.entityIndex;
    this.getInstituionFromStorage();
  }

  getInstituionFromStorage(stopLoader?) {
    stopLoader ? null : this.utils.startLoader();
    this.institutionService
      .getInstituionFromStorage()
      .then((institutions) => {
        this.institutionList = institutions;
        this.entity = this.institutionList.entities[this.entityType][this.entityIndex];
        this.getSubmissionArr();
        this.utils.stopLoader();
      })
      .catch((error) => {
        this.entity = null;
        this.utils.stopLoader();
      });
  }

  getSubmissionArr() {
    this.localStorage
      .getLocalStorage(storageKeys.submissionIdArray)
      .then((allId) => {
        this.submissionArr = allId;
        this.applySubmission();
      })
      .catch((err) => {});
  }

  applySubmission() {
    this.institutionList.entities[this.entityType][this.entityIndex].solutions.map((sol) => {
      if (!sol.allowMultipleAssessemts) {
        this.submissionArr.includes(sol.submissions[0]._id) ? (sol.submissions[0].downloaded = true) : null;
      }
    });
  }

  goToEcm(solutionIndex, submissionId) {
    let heading = this.institutionList.entities[this.entityType][this.entityIndex].name;
    let recentlyUpdatedEntity = {
      programName: this.institutionList.entities[this.entityType][this.entityIndex].solutions[solutionIndex]
        .programName,
      ProgramId: this.institutionList.entities[this.entityType][this.entityIndex].solutions[solutionIndex].programId,
      EntityName: this.institutionList.entities[this.entityType][this.entityIndex].name,
      EntityId: this.institutionList.entities[this.entityType][this.entityIndex]._id,
      submissionId: submissionId,
    };
    console.log("go to ecm called" + submissionId);

    this.localStorage
      .getLocalStorage(this.utils.getAssessmentLocalStorageKey(submissionId))
      .then((successData) => {
        console.log(JSON.stringify(successData));
        console.log("after modification");
        if (successData.assessment.evidences.length > 1) {
          this.appCtrl.getRootNav().push("EvidenceListPage", {
            _id: submissionId,
            name: heading,
            recentlyUpdatedEntity: recentlyUpdatedEntity,
          });
        } else {
          if (successData.assessment.evidences[0].startTime) {
            this.utils.setCurrentimageFolderName(successData.assessment.evidences[0].externalId, submissionId);

            this.appCtrl.getRootNav().push("SectionListPage", {
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

  getAssessmentDetails(solutionIndex) {
    this.utils.startLoader();
    let event = {
      entityIndex: this.entityIndex,
      entityType: this.entityType,
      solutionIndex: solutionIndex,
    };

    this.institutionService
      .getAssessmentDetails(event, this.institutionList)
      .then(async (institutions) => {
        if (
          this.institutionList.entities[this.entityType][this.entityIndex].solutions[solutionIndex].submissions.length
        ) {
          this.getSubmissionArr();
        } else {
          await this.programService.refreshObservationList();
          await this.getInstituionFromStorage("stopLoader");
        }
      })
      .catch((error) => {
        this.utils.stopLoader();
      });
  }

  goToObservationSubmission(programId, observationId) {
    let EntityId = this.institutionList.entities[this.entityType][this.entityIndex]._id;

    this.localStorage
      .getLocalStorage(storageKeys.programList)
      .then((programs) => {
        let programIndex = programs.map((p) => p._id).indexOf(programId);
        let solutionIndex = programs[programIndex].solutions.map((s) => s._id).indexOf(observationId);
        let entityIndex = programs[programIndex].solutions[solutionIndex].entities.map((e) => e._id).indexOf(EntityId);

        let data = {
          programIndex: programIndex,
          solutionIndex: solutionIndex,
          entityIndex: entityIndex,
        };
        if (
          programs[programIndex].solutions[solutionIndex].entities[entityIndex].submissions &&
          programs[programIndex].solutions[solutionIndex].entities[entityIndex].submissions.length
        ) {
          this.appCtrl.getRootNav().push(ProgramObservationSubmissionPage, { data });
        } else {
          let event = {
            programIndex: programIndex,
            solutionIndex: solutionIndex,
            entityIndex: entityIndex,
            submission: {
              submissionNumber: 1,
              observationId: programs[programIndex].solutions[solutionIndex]._id,
            },
          };

          this.programService.getAssessmentDetailsForObservation(event, programs).then(async (programs) => {
            this.utils.startLoader();
            await this.programService.refreshObservationList();
            this.utils.stopLoader();
            this.appCtrl.getRootNav().push(ProgramObservationSubmissionPage, { data });
          });
        }
      })
      .catch((err) => {});
  }

  goToAssessmentSubmission(programId, solutionId) {
    let EntityId = this.institutionList.entities[this.entityType][this.entityIndex]._id;

    this.localStorage
      .getLocalStorage(storageKeys.programList)
      .then((programs) => {
        let programIndex = programs.map((p) => p._id).indexOf(programId);
        let solutionIndex = programs[programIndex].solutions.map((s) => s._id).indexOf(solutionId);
        let entityIndex = programs[programIndex].solutions[solutionIndex].entities.map((e) => e._id).indexOf(EntityId);

        let navData = {
          programIndex: programIndex,
          solutionIndex: solutionIndex,
          entityIndex: entityIndex,
        };
        if (!programs[programIndex].solutions[solutionIndex].entities[entityIndex].submissions.length) {
          let event = {
            programIndex: programIndex,
            assessmentIndex: solutionIndex,
            entityIndex: entityIndex,
          };
          this.programService
            .getAssessmentDetails(event, programs)
            .then(async () => {
              await this.programService.refreshObservationList();
              await this.getInstituionFromStorage();
              this.appCtrl.getRootNav().push(ProgramAssessmentSubmissionPage, { navData });
            })
            .catch((err) => {});
        } else {
          this.appCtrl.getRootNav().push(ProgramAssessmentSubmissionPage, { navData });
        }
      })
      .catch((err) => {});
  }
}
