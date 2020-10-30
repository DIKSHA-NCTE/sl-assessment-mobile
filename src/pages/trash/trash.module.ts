import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TrashPage } from './trash';
import { ComponentsModule } from '../../components/components.module';
import { TranslateModule } from '@ngx-translate/core';
import { TrashProvider } from './trash/trash';
import { TrashActionPage } from './trash-action/trash-action';

@NgModule({
  declarations: [TrashPage, TrashActionPage],
  imports: [IonicPageModule.forChild(TrashPage), ComponentsModule, TranslateModule],
  providers: [TrashProvider],
  entryComponents: [TrashPage, TrashActionPage],
})
export class TrashPageModule {}
