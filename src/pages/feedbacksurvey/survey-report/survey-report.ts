import { Component } from "@angular/core";
import { NavController, NavParams, ModalController } from "ionic-angular";
import { ApiProvider } from "../../../providers/api/api";
import { AppConfigs } from "../../../providers/appConfig";
import { QuestionListPage } from "../../question-list/question-list";
import { UtilsProvider } from "../../../providers/utils/utils";
import { EvidenceAllListComponent } from "../../../components/evidence-all-list/evidence-all-list";

/**
 * Generated class for the SurveyReportPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: "page-survey-report",
  templateUrl: "survey-report.html",
})
export class SurveyReportPage {
  submissionId: any;
  solutionId: any;
  reportObj: any;
  error: string;
  allQuestions: Array<Object> = [];
  filteredQuestions: Array<any> = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public apiService: ApiProvider,
    private modal: ModalController,
    private utils: UtilsProvider
  ) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad SurveyReportPage");
    this.submissionId = this.navParams.get("submissionId");
    this.solutionId = this.navParams.get("solutionId");
    this.getObservationReports();
  }
  getObservationReports() {
    let payload = {};
    payload["filter"] = {
      questionId: this.filteredQuestions,
    };
    let url;
    if (this.submissionId) {
      url = AppConfigs.surveyFeedback.submissionReport + this.submissionId;
    } else {
      url = AppConfigs.surveyFeedback.solutionReport + this.solutionId;
    }
    this.utils.startLoader();
    this.apiService.httpPost(
      url,
      payload,

      (success) => {

        this.allQuestions =
          success.allQuestions && !this.allQuestions.length ? success.allQuestions : this.allQuestions;
        if (success.result == false) {
          this.error = success.message;
        } else {
          this.reportObj = success;
        }
        this.utils.stopLoader();
        !this.filteredQuestions.length ? this.markAllQuestionSelected() : null;
      },
      (error) => {
        this.error = "No data found";
      },
      {
        baseUrl: "dhiti",
        version: "v1",
      }
    );
  }

  markAllQuestionSelected() {
    for (const question of this.allQuestions) {
      this.filteredQuestions.push(question["questionExternalId"]);
    }
  }

  openFilter() {
    const modal = this.modal.create(QuestionListPage, {
      allQuestions: this.allQuestions,
      filteredQuestions: JSON.parse(JSON.stringify(this.filteredQuestions)),
    });
    modal.present();
    modal.onDidDismiss((response) => {
      if (
        response &&
        response.action === "updated" &&
        JSON.stringify(response.filter) !== JSON.stringify(this.filteredQuestions)
      ) {
        this.filteredQuestions = response.filter;
        this.getObservationReports();
      }
    });
  }

  allEvidence(index): void {
    console.log(this.allQuestions[index]);
    this.navCtrl.push(EvidenceAllListComponent, {
      submissionId: this.submissionId,
      solutionId: this.solutionId,
      questionExternalId: this.allQuestions[index]["questionExternalId"],
      surveyEvidence: true,
    });
  }
}
