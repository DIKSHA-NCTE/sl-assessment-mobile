import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { ImprovementProjectPage } from "./improvement-project";
import { ImprovementProjectEntityPage } from "./improvement-project-entity/improvement-project-entity";
import { TranslateModule } from "@ngx-translate/core";
import { ComponentsModule } from "../../components/components.module";
import { ImprovementProjectEntitySolutionPage } from "./improvement-project-entity-solution/improvement-project-entity-solution";
import { SuggestedImprovementsPage } from "./suggested-improvements/suggested-improvements";

@NgModule({
  declarations: [
    ImprovementProjectPage,
    ImprovementProjectEntityPage,
    ImprovementProjectEntitySolutionPage,
    SuggestedImprovementsPage,
  ],
  imports: [
    ComponentsModule,
    TranslateModule,
    IonicPageModule.forChild(ImprovementProjectPage),
  ],
  entryComponents: [
    ImprovementProjectEntityPage,
    ImprovementProjectEntitySolutionPage,
    SuggestedImprovementsPage,
  ],
})
export class ImprovementProjectPageModule {}
