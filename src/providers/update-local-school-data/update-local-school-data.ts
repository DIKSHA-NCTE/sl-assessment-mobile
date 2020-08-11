import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiProvider } from "../api/api";
import { AppConfigs } from "../appConfig";
import { UtilsProvider } from "../utils/utils";
import { CurrentUserProvider } from "../current-user/current-user";
import { LocalStorageProvider } from "../local-storage/local-storage";
import { storageKeys } from "../storageKeys";

@Injectable()
export class UpdateLocalSchoolDataProvider {
  schoolDetails: any;
  currentSchool: any;
  updatedSubmissionStatus: any;

  constructor(
    public http: HttpClient,
    private apiService: ApiProvider,
    private localStorage: LocalStorageProvider,
    private utils: UtilsProvider,
    private currentUser: CurrentUserProvider
  ) {}

  getSubmissionStatus(): void {
    const url = AppConfigs.survey.getSubmissionStatus + this.currentSchool.assessment.submissionId;
    this.apiService.httpGet(
      url,
      (success) => {
        this.updatedSubmissionStatus = success.result.evidences;
        this.utils.stopLoader();
        this.checkForLocalDataUpdate();
      },
      (error) => {
        this.utils.stopLoader();
      }
    );
  }

  getLocalData(obj, submissionStatus?: any): void {
    this.localStorage.getLocalStorage(this.utils.getAssessmentLocalStorageKey(obj._id)).then((data) => {
      this.schoolDetails = data;
      this.currentSchool = this.schoolDetails;
      if (submissionStatus) {
        this.updatedSubmissionStatus = submissionStatus;
        this.updateSubmissionsOnLogin(obj._id);
      } else {
        this.utils.startLoader();
        this.getSubmissionStatus();
      }
    });
    // this.storage.get('schoolsDetails').then(details => {
    //   this.schoolDetails = JSON.parse(details);
    //   this.currentSchool = this.schoolDetails[obj._id];
    //   if (submissionStatus) {
    //     this.updatedSubmissionStatus = submissionStatus;
    //     this.updateSubmissionsOnLogin(obj._id);
    //   } else {
    //     this.utils.startLoader();
    //     this.getSubmissionStatus();
    //   }
    // })
  }

  mapSubmissionDataToQuestion(schoolDetails, isObservation?: boolean): void {
    let mappedData;
    // for (const schoolId of Object.keys(schoolDetails)) {
    //   mappedData = this.updateSubmissionsOnLogin(schoolDetails);
    //   // schoolObj[mappedData["schoolProfile"]["_id"]] = mappedData;

    // }
    mappedData = this.updateSubmissionsOnLogin(schoolDetails);
    if (isObservation) {
      mappedData.observation = true;
    }

    this.localStorage.setLocalStorage(
      this.utils.getAssessmentLocalStorageKey(schoolDetails.assessment.submissionId),
      mappedData
    );
    // this.storage.set('schoolsDetails', JSON.stringify(schoolObj));
    // this.events.publish("localDataUpdated");
  }
  updateSubmissionsOnLogin(schoolData) {
    const assessment = schoolData.assessment;
    // const assessmentEvidence = schoolData.assessments[0] ? schoolData.assessments[0] : schoolData.assessments.evidences;
    for (const evidence of assessment.evidences) {
      const validSubmission = assessment.submissions[evidence.externalId];
      if (validSubmission) {
        evidence.notApplicable = validSubmission.notApplicable;
        for (const section of evidence.sections) {
          for (const question of section.questions) {
            // // console.logg(question._id)
            if (question.responseType === "pageQuestions") {
              for (const questions of question.pageQuestions) {
                questions.value =
                  questions.responseType !== "matrix"
                    ? validSubmission.answers[questions._id].value
                    : this.constructMatrixValue(validSubmission, questions, evidence.externalId);
                questions.remarks = validSubmission.answers[questions._id].remarks;
              }
            } else if (validSubmission.answers && validSubmission.answers[question._id]) {
              question.value =
                question.responseType !== "matrix"
                  ? validSubmission.answers[question._id].value
                  : this.constructMatrixValue(validSubmission, question, evidence.externalId);
              question.remarks = validSubmission.answers[question._id].remarks;
            }
          }
        }
      }
    }
    return schoolData;
  }

  checkForLocalDataUpdate(): void {
    for (const evidence of this.currentSchool.assessment.evidences) {
      const validSubmission = this.getValidSubmissionForEvidenceMethod(evidence.externalId);
      evidence.isSubmitted = validSubmission.submittedBy ? true : false;
      evidence.startTime = validSubmission.startTime;
      evidence.endTime = validSubmission.endTime;
      if (
        (validSubmission &&
          validSubmission.submittedBy !== this.currentUser.getCurrentUserData().sub.split(":").pop() &&
          !evidence.startTime) ||
        (validSubmission && validSubmission.submittedBy === this.currentUser.getCurrentUserData().sub.split(":").pop())
      ) {
        for (const section of evidence.sections) {
          for (const question of section.questions) {
            question.value =
              question.responseType !== "matrix"
                ? validSubmission.answers[question._id].value
                : this.constructMatrixValue(validSubmission, question, evidence.externalId);
            question.remarks = validSubmission.answers[question._id].remarks;
          }
        }
      }
    }
    this.localStorage.setLocalStorage(
      this.utils.getAssessmentLocalStorageKey(this.currentSchool.assessment.submissionId),
      this.schoolDetails
    );
    // this.storage.set('schoolsDetails', JSON.stringify(this.schoolDetails));
    // this.events.publish("localDataUpdated");
  }

  constructMatrixValue(validSubmission, matrixQuestion, ecmId) {
    matrixQuestion.value = [];
    if (
      validSubmission.answers &&
      validSubmission.answers[matrixQuestion._id] &&
      validSubmission.answers[matrixQuestion._id].value
    ) {
      for (const answer of validSubmission.answers[matrixQuestion._id].value) {
        matrixQuestion.value.push(JSON.parse(JSON.stringify(matrixQuestion.instanceQuestions)));
      }
      matrixQuestion.value.forEach((instance, index) => {
        instance.forEach((question) => {
          if (
            validSubmission.answers[matrixQuestion._id] &&
            validSubmission.answers[matrixQuestion._id].value[index][question._id]
          ) {
            question.value = validSubmission.answers[matrixQuestion._id].value[index][question._id].value;
            question.remarks = validSubmission.answers[matrixQuestion._id].value[index][question._id].remarks;
          }
        });
      });
      return matrixQuestion.value;
    } else {
      return [];
    }
  }

  getValidSubmissionForEvidenceMethod(ECMexternalId): any {
    if (this.updatedSubmissionStatus[ECMexternalId].isSubmitted) {
      for (const submission of this.updatedSubmissionStatus[ECMexternalId].submissions) {
        if (submission.isValid) {
          return submission;
        }
      }
      return {};
    } else {
      return "";
    }
  }

  async updateSubmissionIdArr(submissionId) {
    await this.localStorage
      .getLocalStorage(storageKeys.submissionIdArray)
      .then(async (arr) => {
        Array.isArray(submissionId) ? arr.concat(submissionId) : arr.push(submissionId);
        await this.localStorage.setLocalStorage(storageKeys.submissionIdArray, arr);
      })
      .catch((err) => {
        let arr;
        Array.isArray(submissionId) ? (arr = submissionId) : (arr = [submissionId]);
        this.localStorage.setLocalStorage(storageKeys.submissionIdArray, arr);
      });
  }

  storeObsevationSubmissionId(obsevationSubmissionId) {
    // obsevationSubmissionId can be array(only when migration is run) or string (single value)
    this.localStorage
      .getLocalStorage(storageKeys.observationSubmissionIdArr)
      .then((arr) => {
        Array.isArray(obsevationSubmissionId) ? arr.concat(obsevationSubmissionId) : arr.push(obsevationSubmissionId);
        this.localStorage.setLocalStorage(storageKeys.observationSubmissionIdArr, arr);
      })
      .catch((err) => {
        let arr;
        Array.isArray(obsevationSubmissionId) ? (arr = obsevationSubmissionId) : (arr = [obsevationSubmissionId]);
        this.localStorage.setLocalStorage(storageKeys.observationSubmissionIdArr, arr);
      });
  }
}
