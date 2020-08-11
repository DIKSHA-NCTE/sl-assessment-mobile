import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { ReportsPage } from "./reports";
import { ReportEntityListingPage } from "./report-entity-listing/report-entity-listing";
import { TranslateModule } from "@ngx-translate/core";
import { ComponentsModule } from "../../components/components.module";
import { ReportProgramSolutionPage } from "./report-program-solution/report-program-solution";
import { ProgramListingPage } from "./program-listing/program-listing";

@NgModule({
  declarations: [
    ReportsPage,
    ProgramListingPage,
    ReportEntityListingPage,
    ReportProgramSolutionPage,
  ],
  imports: [
    IonicPageModule.forChild(ReportsPage),
    TranslateModule,
    ComponentsModule,
  ],
  entryComponents: [
    ProgramListingPage,
    ReportsPage,
    ReportEntityListingPage,
    ReportProgramSolutionPage,
  ],
})
export class ReportsPageModule {}
