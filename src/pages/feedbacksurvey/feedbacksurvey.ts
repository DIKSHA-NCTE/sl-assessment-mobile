import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams, ModalController, ViewController } from "ionic-angular";
import { SurveyProvider } from "./provider/survey/survey";
import { LocalStorageProvider } from "../../providers/local-storage/local-storage";
import { storageKeys } from "../../providers/storageKeys";
import { UtilsProvider } from "../../providers/utils/utils";
import { QuestionerPage } from "../questioner/questioner";
import { SurveyReportPage } from "./survey-report/survey-report";

/**
 * Generated class for the FeedbacksurveyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-feedbacksurvey",
  templateUrl: "feedbacksurvey.html",
})
export class FeedbacksurveyPage {
  surveyList: any;
  submissionArr: any;
  link: any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public surveyProvider: SurveyProvider,
    public localStorage: LocalStorageProvider,
    public utils: UtilsProvider,
    public modalCtrl: ModalController,
    public viewCtrl: ViewController
  ) {}

  ionViewDidLoad(): void {
    this.link = this.navParams.get("surveyId");
  }
  ionViewWillEnter() {
    this.link ? this.deepLinkRedirect() : this.getSurveyListing();
  }

  getSurveyListing(): void {
    this.utils.startLoader();
    this.surveyProvider.getSurveyListing().then(
      (list) => {
        this.surveyList = list;
        console.log(list);
        this.getSubmissionArr();
        this.utils.stopLoader();
      },
      (err) => {
        this.utils.stopLoader();
        console.log(err);
      }
    );
  }

  //check if suvey detail is present in local storage
  getSubmissionArr(): void {
    this.localStorage
      .getLocalStorage(storageKeys.submissionIdArray)
      .then((allId) => {
        this.submissionArr = allId;
        this.applySubmission(); // make downloaded = true
      })
      .catch((err) => {});
  }

  applySubmission(): void {
    this.surveyList.map((survey) => {
      console.log(this.submissionArr.includes(survey.submissionsId));
      this.submissionArr.includes(survey.submissionId) ? (survey.downloaded = true) : null;
    });
  }

  deepLinkRedirect(): void {
    let survey;
    this.surveyProvider
      .getDetailsByLink(this.link)
      .then((data) => {
        if (data.result == false) {
          this.surveyProvider.showMsg("surveyExpired", true);
          return;
        }
        if (data.result.status && data.result.status == "completed") {
          this.surveyProvider.showMsg("surveyCompleted", true);

          return;
        }
        survey = data.result;

        this.storeRedirect(survey);
      })

      .catch((err) => {
        this.utils.stopLoader();

        console.log(err);
      });
  }

  redirect(submissionId: any): void {
    const navParams = { _id: submissionId, selectedEvidence: 0, selectedSection: 0 };
    this.navCtrl.push(QuestionerPage, navParams).then(() => {
      this.link ? this.viewCtrl.dismiss() : null;
    });
  }

  storeRedirect(survey): void {
    this.surveyProvider
      .storeSurvey(survey.assessment.submissionId, survey)
      .then((survey) => this.redirect(survey.assessment.submissionId));
  }

  checkReport(survey) {
    if (survey.submissionId) {
      this.navCtrl.push(SurveyReportPage, { submissionId: survey.submissionId});
      return;
    }
    this.navCtrl.push(SurveyReportPage, { solutionId: survey.solutionId });
  }

  getSurveyById(surveyId) {
    if (!surveyId) {
      return;
    }
    this.surveyProvider
      .getDetailsById(surveyId)
      .then((res) => {
        const survey = res.result;
        this.storeRedirect(survey);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  onSurveyClick(survey) {
    if (survey.status == "completed") {
      this.surveyProvider.showMsg("surveyCompleted");
      return;
    }
    survey.downloaded ? this.redirect(survey.submissionId) : this.getSurveyById(survey.surveyId);
  }
}
