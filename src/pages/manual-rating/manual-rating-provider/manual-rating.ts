import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiProvider } from "../../../providers/api/api";
import { AppConfigs } from "../../../providers/appConfig";

/*
  Generated class for the ManualRatingProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ManualRatingProvider {
  constructor(public http: HttpClient, private api: ApiProvider) {
    console.log("Hello ManualRatingProvider Provider");
  }

  getRatingData(submissionid: string): Promise<any> {
    const url = AppConfigs.assessmentsList.getCriteriaQuestions + submissionid;
    return new Promise((resolve, reject) => {
      this.api.httpGet(
        url,
        (success) => {
          resolve(success.result);
        },
        (err) => {
          reject(err);
        }
      );
    });
  }

  submitManualRating(responseObj: any, submissionId: string): Promise<any> {
    const url = AppConfigs.assessmentsList.manualRating + submissionId;
    return new Promise((resolve, reject) => {
      this.api.httpPost(
        url,
        responseObj,
        (success) => {
          resolve(success);
        },
        (err) => {
          reject(err);
        }
      );
    });
  }

  checkAllECMStatus(submissionId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const url = AppConfigs.survey.getSubmissionStatus + submissionId;
      this.api.httpGet(
        url,
        (success) => {
          resolve(success.result);
        },
        (err) => {
          reject(err);
        }
      );
    });
  }
}
