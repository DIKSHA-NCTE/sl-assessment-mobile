import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { UtilsProvider } from "../../providers/utils/utils";
import { AppConfigs } from "../../providers/appConfig";
import { UpdateLocalSchoolDataProvider } from "../../providers/update-local-school-data/update-local-school-data";
import { ApiProvider } from "../../providers/api/api";
import { LocalStorageProvider } from "../../providers/local-storage/local-storage";
import { storageKeys } from "../../providers/storageKeys";

/*
  Generated class for the InstitutionServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class InstitutionServiceProvider {
  constructor(
    public http: HttpClient,
    public utils: UtilsProvider,
    private apiService: ApiProvider,
    private ulsdp: UpdateLocalSchoolDataProvider,
    private localStorage: LocalStorageProvider
  ) {
    console.log("Hello InstitutionServiceProvider Provider");
    console.log("Hello InstitutionServiceProvider Provider");
  }

  getInstituionFromStorage() {
    // this.utils.startLoader();
    return this.localStorage
      .getLocalStorage(storageKeys.institutionFlowList)
      .then((data) => {
        if (data) {
          // this.migrationFuntion(data);
          return data;
        } else {
          return this.getInstitutionsflowApi();
        }
      })
      .catch((error) => {
        return this.getInstitutionsflowApi();
      });
  }

  getInstitutionsflowApi() {
    return new Promise((resolve, reject) => {
      const url = AppConfigs.institutionsFlow.institutions;

      this.apiService.httpGet(
        url,
        (successData) => {
          this.localStorage.setLocalStorage(storageKeys.institutionFlowList, successData.result);
          resolve(successData.result);
        },
        (error) => {
          reject();
        }
      );
    });
  }

  getAssessmentDetails(event, institutionList) {
    return new Promise((resolve, reject) => {
      let entityIndex = event.entityIndex;
      let entityType = event.entityType;
      let solutionIndex = event.solutionIndex;

      let programId = institutionList.entities[entityType][entityIndex].solutions[solutionIndex].programId;
      let solutionId = institutionList.entities[entityType][entityIndex].solutions[solutionIndex]._id;
      let entityId = institutionList.entities[entityType][entityIndex]._id;

      const url =
        AppConfigs.assessmentsList.detailsOfAssessment +
        programId +
        "?solutionId=" +
        solutionId +
        "&entityId=" +
        entityId;
      this.apiService.httpGet(
        url,
        async (success) => {
          this.ulsdp.mapSubmissionDataToQuestion(success.result);
          const generalQuestions = success.result["assessment"]["generalQuestions"]
            ? success.result["assessment"]["generalQuestions"]
            : null;
          this.localStorage.setLocalStorage(
            "generalQuestions_" + success.result["assessment"]["submissionId"],
            generalQuestions
          );
          this.localStorage.setLocalStorage(
            "generalQuestionsCopy_" + success.result["assessment"]["submissionId"],
            generalQuestions
          );
          await this.ulsdp.updateSubmissionIdArr(success.result.assessment.submissionId);
          await this.localStorage.setLocalStorage(success.result["assessment"]["submissionId"], success.result);
          await this.localStorage.setLocalStorage(storageKeys.institutionFlowList, institutionList);
          this.utils.stopLoader();

          resolve(institutionList);
        },
        (error) => {
          reject();
        },
        { version: "v2" }
      );
    });
  }
}
