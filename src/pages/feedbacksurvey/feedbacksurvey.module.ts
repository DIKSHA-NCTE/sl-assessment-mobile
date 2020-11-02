import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { FeedbacksurveyPage } from "./feedbacksurvey";
import { ComponentsModule } from "../../components/components.module";
import { TranslateModule } from "@ngx-translate/core";
import { SurveyProvider } from "./provider/survey/survey";
import { SurveyReportPage } from "./survey-report/survey-report";

@NgModule({
  declarations: [FeedbacksurveyPage, SurveyReportPage],
  imports: [IonicPageModule.forChild(FeedbacksurveyPage), ComponentsModule, TranslateModule],
  providers: [SurveyProvider],
  entryComponents: [FeedbacksurveyPage, SurveyReportPage],
})
export class FeedbacksurveyPageModule {}
