import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';
import { ComponentsModule } from '../../components/components.module';
import { OnboardingPage } from './onboarding';
import { OnboardingEntityListingModalPage } from './onboarding-entity-listing-modal/onboarding-entity-listing-modal';


@NgModule({
  declarations: [
    OnboardingPage,
    OnboardingEntityListingModalPage
  ],
  imports: [
    IonicPageModule.forChild(OnboardingPage),
    TranslateModule,
    ComponentsModule,
  ],
  entryComponents:[
    OnboardingEntityListingModalPage
  ]
})
export class OnboardingPageModule { }
