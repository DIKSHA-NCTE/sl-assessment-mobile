import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { ManualRatingPage } from "./manual-rating";
import { ComponentsModule } from "../../components/components.module";
import { TranslateModule } from "@ngx-translate/core";
import { ManualRatingProvider } from "./manual-rating-provider/manual-rating";

@NgModule({
  declarations: [ManualRatingPage],
  imports: [IonicPageModule.forChild(ManualRatingPage), ComponentsModule, TranslateModule],
  entryComponents: [ManualRatingPage],
  providers: [ManualRatingProvider],
})
export class ManualRatingPageModule {}
