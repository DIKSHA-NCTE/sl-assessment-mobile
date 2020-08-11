import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { InstitutionPage } from "./institution";
import { ComponentsModule } from "../../components/components.module";
import { TranslateModule } from "@ngx-translate/core";
import { InstitutionSolutionPage } from "./institution-solution/institution-solution";
import { InstitutionServiceProvider } from "./institution-service";

@NgModule({
  declarations: [InstitutionPage, InstitutionSolutionPage],
  imports: [
    IonicPageModule.forChild(InstitutionPage),
    ComponentsModule,
    TranslateModule,
  ],
  entryComponents: [InstitutionPage, InstitutionSolutionPage],
  providers: [InstitutionServiceProvider],
})
export class InstitutionPageModule {}
