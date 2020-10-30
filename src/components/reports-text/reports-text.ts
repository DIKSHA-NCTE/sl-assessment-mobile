import { Component, Input, OnInit } from "@angular/core";
import { SurveyProvider } from "../../pages/feedbacksurvey/provider/survey/survey";

/**
 * Generated class for the ReportsTextComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: "reports-text",
  templateUrl: "reports-text.html",
})
export class ReportsTextComponent implements OnInit {
  @Input() data;
  @Input() questionNumber;
  @Input() isFeedBackSurvey;
  @Input() solutionId;
  completedDate: any; // for pagination purpose in survey answers if more then 10 ans

  constructor(public surveyProvider: SurveyProvider) {
  }
  ngOnInit(): void {
    this.completedDate = this.data.completedDate;
  }

  getAllResponse() {
    let questionExternalId = this.data.order;
    let completedDate = this.completedDate;
    let solutionId = this.solutionId;
    let Obj = { questionExternalId, completedDate, solutionId };
    this.surveyProvider
      .viewAllAns(Obj)
      .then((res: any) => {
        this.data.answers = [...this.data.answers, ...res.answers];
        this.completedDate = res.completedDate ? res.completedDate : this.completedDate;
      })
      .catch();
  }
}
