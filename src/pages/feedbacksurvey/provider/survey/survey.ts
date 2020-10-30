import { Injectable } from "@angular/core";
import { AppConfigs } from "../../../../providers/appConfig";
import { ApiProvider } from "../../../../providers/api/api";
import { LocalStorageProvider } from "../../../../providers/local-storage/local-storage";
import { UtilsProvider } from "../../../../providers/utils/utils";
import { UpdateLocalSchoolDataProvider } from "../../../../providers/update-local-school-data/update-local-school-data";
import { storageKeys } from "../../../../providers/storageKeys";
import { SurveyMsgComponent } from "../../../../components/survey-msg/survey-msg";
import { ModalController, App } from "ionic-angular";

/*
  Generated class for the SurveyProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class SurveyProvider {
  submissionArr: any;
  constructor(
    public apiProvider: ApiProvider,
    public localStorage: LocalStorageProvider,
    public utils: UtilsProvider,
    public ulsdp: UpdateLocalSchoolDataProvider,
    public app: App,
    public modalCtrl: ModalController
  ) {
    console.log("Hello SurveyProvider Provider");
  }

  // get all list
  getSurveyListing(): Promise<any> {
    const url = AppConfigs.surveyFeedback.surveyListing;
    return new Promise((resolve, reject) => {
      this.apiProvider.httpGet(
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

  // pass the link which is present in deeplink(deeplink last param)
  getDetailsByLink(link): Promise<any> {
    const url = AppConfigs.surveyFeedback.getDetailsByLink + link;
    return new Promise((resolve, reject) => {
      this.apiProvider.httpGet(
        url,
        (success) => {
          resolve(success);
        },
        (err) => {
          reject(err);
        }
      );
    });
  }

  getDetailsById(surveyId): Promise<any> {
    const url = AppConfigs.surveyFeedback.getDetailsById + surveyId;
    return new Promise((resolve, reject) => {
      this.apiProvider.httpGet(
        url,
        (success) => {
          resolve(success);
        },
        (err) => {
          reject(err);
        }
      );
    });
  }

  storeSurvey(submissionId, survey) {
    return this.localStorage
      .getLocalStorage(storageKeys.submissionIdArray)
      .then((submissionArr) => {
        const x = submissionArr.includes(submissionId);
        if (!x) {
          survey["assessment"]["evidences"][0].startTime = Date.now();
          survey["survey"] = true;
          this.localStorage.setLocalStorage(this.utils.getAssessmentLocalStorageKey(submissionId), survey);
          this.ulsdp.updateSubmissionIdArr(submissionId);
          return survey;
        } else {
          return survey;
        }
      })
      .catch((err) => {
        survey["assessment"]["evidences"][0].startTime = Date.now();
        survey["survey"] = true;
        this.localStorage.setLocalStorage(this.utils.getAssessmentLocalStorageKey(submissionId), survey);
        this.ulsdp.updateSubmissionIdArr(submissionId);
        return survey;
      });
  }

  showMsg(option, popToRoot = false): void {
    popToRoot ? this.app.getRootNav().popToRoot() : null;
    const modal = this.modalCtrl.create(SurveyMsgComponent, { option: option });
    modal.present();
  }

  viewAllAns(payload) {
    let url = AppConfigs.surveyFeedback.getAllAnswers;
   
    return new Promise((resolve, reject) => {
      this.apiProvider.httpPost(
        url,
        payload,
        (success) => {
          this.utils.stopLoader();
          resolve(success);
        },
        (error) => {
          this.utils.openToast(error.message);
          this.utils.stopLoader();
          reject();
        },
        { baseUrl: "dhiti" }
      );
    });
  }
}
