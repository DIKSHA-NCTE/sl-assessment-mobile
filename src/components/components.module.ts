import { NgModule } from '@angular/core';
import { InputTypeComponent } from './input-type/input-type';
import { RadioTypeComponent } from './radio-type/radio-type';
import { IonicModule } from 'ionic-angular';
import { MultipleChoiceTypeComponent } from './multiple-choice-type/multiple-choice-type';
import { DateTypeComponent } from './date-type/date-type';
import { RemarksComponent } from './remarks/remarks';
import { ImageUploadComponent } from './image-upload/image-upload';
import { DirectivesModule } from '../directives/directives.module';
import { MatrixTypeComponent } from './matrix-type/matrix-type';
import { MatrixModalComponent } from './matrix-modal/matrix-modal';
import { TranslateModule } from "@ngx-translate/core";
import { FooterButtonsComponent } from './footer-buttons/footer-buttons';
import { HeaderComponent } from './header/header';
import { Network } from '@ionic-native/network';
import { MenuItemComponent } from './menu-item/menu-item';
import { DatePipe } from '@angular/common';
import { DynamicFormComponent } from './dynamic-form/dynamic-form';
import { SlackProvider } from '../providers/slack/slack';
import { SliderComponent } from './slider/slider';
import { EntityListingComponent } from './entity-listing/entity-listing';
import { PipesModule } from '../pipes/pipes.module';
import { SelectableListComponent } from './selectable-list/selectable-list';
import { ObservationEntityListingComponent } from './observation-entity-listing/observation-entity-listing';
import { QuestionHeadingComponent } from './question-heading/question-heading';
import { ProgressBarComponent } from './progress-bar/progress-bar';

@NgModule({
	declarations: [
		InputTypeComponent,
		RadioTypeComponent,
    MultipleChoiceTypeComponent,
    DateTypeComponent,
    RemarksComponent,
    ImageUploadComponent,
    MatrixTypeComponent,
    MatrixModalComponent,
    FooterButtonsComponent,
    HeaderComponent,
    MenuItemComponent,
    DynamicFormComponent,
    SliderComponent,
    EntityListingComponent,
    SelectableListComponent,
    ObservationEntityListingComponent,
    QuestionHeadingComponent,
    ProgressBarComponent
  ],
	imports: [
		IonicModule,
    DirectivesModule,
    PipesModule,
    TranslateModule,
  
	],
	exports: [
		InputTypeComponent,
		RadioTypeComponent,
    MultipleChoiceTypeComponent,
    DateTypeComponent,
    RemarksComponent,
    ImageUploadComponent,
    MatrixTypeComponent,
    MatrixModalComponent,
    FooterButtonsComponent,
    HeaderComponent,
    MenuItemComponent,
    DynamicFormComponent,
    SliderComponent,
    EntityListingComponent,
    SelectableListComponent,
    ObservationEntityListingComponent,
    QuestionHeadingComponent,
    ProgressBarComponent
	],
	entryComponents: [
		InputTypeComponent,
		RadioTypeComponent,
		MatrixModalComponent,
    MenuItemComponent,
    EntityListingComponent
	],
	providers:[
		Network, DatePipe, SlackProvider
	]
})
export class ComponentsModule { }
