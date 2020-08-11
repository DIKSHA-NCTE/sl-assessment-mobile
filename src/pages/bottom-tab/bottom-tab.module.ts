import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { BottomTabPage } from "./bottom-tab";
import { TranslateModule } from "@ngx-translate/core";

@NgModule({
  declarations: [BottomTabPage],
  imports: [IonicPageModule.forChild(BottomTabPage), TranslateModule],
  entryComponents: [BottomTabPage],
})
export class BottomTabPageModule {}
