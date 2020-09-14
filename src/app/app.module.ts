import { NgModule, ErrorHandler } from "@angular/core";
import { HttpClientModule, HttpClient } from "@angular/common/http";
import { HttpModule } from "@angular/http";

import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { IonicApp, IonicModule, IonicErrorHandler } from "ionic-angular";
import { InAppBrowser } from "@ionic-native/in-app-browser";
import { IonicStorageModule } from "@ionic/storage";
import { Network } from "@ionic-native/network";
import { MyApp } from "./app.component";

import { AboutPage } from "../pages/about/about";
import { HomePage } from "../pages/home/home";

import { StatusBar } from "@ionic-native/status-bar";
import { SplashScreen } from "@ionic-native/splash-screen";
import { LoginPageModule } from "../pages/login/login.module";
import { AuthProvider } from "../providers/auth/auth";
import { CurrentUserProvider } from "../providers/current-user/current-user";
import { WelcomePage } from "../pages/welcome/welcome";
import { SchoolListProvider } from "../providers/school-list/school-list";
import { UtilsProvider } from "../providers/utils/utils";
import { ApiProvider } from "../providers/api/api";
import { AndroidPermissions } from "@ionic-native/android-permissions";
import { Geolocation } from "@ionic-native/geolocation";
import { Diagnostic } from "@ionic-native/diagnostic";
import { EvidenceListPageModule } from "../pages/evidence-list/evidence-list.module";
import { SectionListPageModule } from "../pages/section-list/section-list.module";
import { QuestionerPageModule } from "../pages/questioner/questioner.module";
import { ComponentsModule } from "../components/components.module";
import { DirectivesModule } from "../directives/directives.module";

import { FaqPage } from "../pages/faq/faq";
import { SocialSharing } from "@ionic-native/social-sharing";

import { EntityProfileEditPage } from "../pages/entity-profile-edit/entity-profile-edit";
import { Camera } from "@ionic-native/camera";
import { File } from "@ionic-native/file";
import { FilePath } from "@ionic-native/file-path";
import { FileTransfer } from "@ionic-native/file-transfer";
import { ImagePicker } from "@ionic-native/image-picker";
import { FileChooser } from "@ionic-native/file-chooser";
import { IOSFilePicker } from "@ionic-native/file-picker";
import { FileOpener } from "@ionic-native/file-opener";

import { ImageListingPage } from "../pages/image-listing/image-listing";
import { MatrixActionModalPage } from "../pages/matrix-action-modal/matrix-action-modal";
import { LocationAccuracy } from "@ionic-native/location-accuracy";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { RatingProvider } from "../providers/rating/rating";
import { RatingCriteriaListingPageModule } from "../pages/rating-criteria-listing/rating-criteria-listing.module";
import { RatingPageModule } from "../pages/rating/rating.module";
import { NetworkGpsProvider } from "../providers/network-gps/network-gps";
import { RatedCriteriaListPageModule } from "../pages/rated-criteria-list/rated-criteria-list.module";
import { FeedbackProvider } from "../providers/feedback/feedback";
import { EvidenceProvider } from "../providers/evidence/evidence";
import { QuestionDashboardPage } from "../pages/question-dashboard/question-dashboard";
import { PhotoLibrary } from "@ionic-native/photo-library";
import { RemarksPage } from "../pages/remarks/remarks";
import { RegistryListPageModule } from "../pages/registry-list/registry-list.module";
import { UpdateLocalSchoolDataProvider } from "../providers/update-local-school-data/update-local-school-data";
import { FeedbackPage } from "../pages/feedback/feedback";
import { DetailPage } from "../pages/detail/detail";
import { Device } from "@ionic-native/device";
import { ExtendedDeviceInformation } from "@ionic-native/extended-device-information";
import { GeneralQuestionListPageModule } from "../pages/general-question-list/general-question-list.module";
import { GeneralQuestionPage } from "../pages/general-question/general-question";
import { GeneralQuestionSubmitPage } from "../pages/general-question-submit/general-question-submit";
import { SlackProvider } from "../providers/slack/slack";
import { Keyboard } from "@ionic-native/keyboard";
import { LocalStorageProvider } from "../providers/local-storage/local-storage";
import { HTTP } from "@ionic-native/http";
import { IndividualListingPage } from "../pages/individual-listing/individual-listing";
import { ProgramDetailsPage } from "../pages/program-details/program-details";
import { InstitutionsEntityList } from "../pages/institutions-entity-list/institutions-entity-list";
import { EntityProfilePageModule } from "../pages/entity-profile/entity-profile.module";
import { ObservationsPageModule } from "../pages/observations/observations.module";
import { AssessmentServiceProvider } from "../providers/assessment-service/assessment-service";
import { Deeplinks } from "@ionic-native/deeplinks";
import { SolutionDetailsPage } from "../pages/solution-details/solution-details";
import { IonicStepperModule } from "ionic-stepper";
import { ObservationProvider } from "../providers/observation/observation";
import { AssessmentAboutPage } from "../pages/assessment-about/assessment-about";
import { EntityListingPage } from "../pages/entity-listing/entity-listing";
import { SharingFeaturesProvider } from "../providers/sharing-features/sharing-features";
import { HintProvider } from "../providers/hint/hint";
import { HintPage } from "../pages/hint/hint";
import { Media } from "@ionic-native/media";
import { PreviewPage } from "../pages/preview/preview";
import { SubmissionListPage } from "../pages/submission-list/submission-list";
import { ObservationServiceProvider } from "../providers/observation-service/observation-service";
import { DownloadAndPreviewProvider } from "../providers/download-and-preview/download-and-preview";
import { ObservationReportsPage } from "../pages/observation-reports/observation-reports";
import { HighchartsChartModule } from "highcharts-angular";
import { UpdateTrackerProvider } from "../providers/update-tracker/update-tracker";
import { RoleListingPage } from "../pages/role-listing/role-listing";

import { DashboardPage } from "../pages/dashboard/dashboard";
import { TextToSpeech } from "@ionic-native/text-to-speech";
import { TextToSpeechProvider } from "../providers/text-to-speech/text-to-speech";
import { ObservationEditPage } from "../pages/observation-edit/observation-edit";
import { NotificationProvider } from "../providers/notification/notification";
import { Badge } from "@ionic-native/badge";
import { AppIconBadgeProvider } from "../providers/app-icon-badge/app-icon-badge";
import { FCM } from "@ionic-native/fcm";
import { FcmProvider } from "../providers/fcm/fcm";
import { LocalNotifications } from "@ionic-native/local-notifications";
import { Market } from "@ionic-native/market";
import { AppVersion } from "@ionic-native/app-version";
import { SettingsPage } from "../pages/settings/settings";
import { SpinnerDialog } from "@ionic-native/spinner-dialog";
import { SidemenuProvider } from "../providers/sidemenu/sidemenu";
import { QuestionListPage } from "../pages/question-list/question-list";
import { TutorialVideoListingPage } from "../pages/tutorial-video-listing/tutorial-video-listing";
import { ScreenOrientation } from "@ionic-native/screen-orientation";
import { EvidenceAllListComponent } from "./../components/evidence-all-list/evidence-all-list";
import { PhotoViewer } from "@ionic-native/photo-viewer";
import { StreamingMedia } from "@ionic-native/streaming-media";
import { ImprovementProjectPageModule } from "../pages/improvement-project/improvement-project.module";
import { AppAvailability } from "@ionic-native/app-availability";

import { CriteriaListPage } from "../pages/criteria-list/criteria-list";
import { ProgramsPageModule } from "../pages/programs/programs.module";
import { InstitutionPageModule } from "../pages/institution/institution.module";
import { BottomTabPageModule } from "../pages/bottom-tab/bottom-tab.module";
import { ReportsPageModule } from "../pages/reports/reports.module";
import { LibraryPageModule } from "../pages/library/library.module";
import { ManualRatingPageModule } from "../pages/manual-rating/manual-rating.module";
import { FeedbackPollPageModule } from "../pages/feedback-poll/feedback-poll.module";
@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    HomePage,
    AssessmentAboutPage,
    WelcomePage,
    InstitutionsEntityList,
    FaqPage,
    EntityProfileEditPage,
    ImageListingPage,
    EntityListingPage,
    MatrixActionModalPage,
    QuestionDashboardPage,
    SolutionDetailsPage,
    RemarksPage,
    FeedbackPage,
    DetailPage,
    GeneralQuestionPage,
    GeneralQuestionSubmitPage,
    IndividualListingPage,
    ProgramDetailsPage,
    HintPage,
    PreviewPage,
    SubmissionListPage,
    ObservationReportsPage,
    RoleListingPage,
    DashboardPage,
    ObservationEditPage,
    SettingsPage,
    QuestionListPage,
    TutorialVideoListingPage,
    CriteriaListPage,
  ],
  imports: [
    BrowserAnimationsModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    HighchartsChartModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: setTranslateLoader,
        deps: [HttpClient],
      },
    }),
    LoginPageModule,
    HttpModule,
    HttpClientModule,
    EntityProfilePageModule,
    EvidenceListPageModule,
    SectionListPageModule,
    QuestionerPageModule,
    ComponentsModule,
    DirectivesModule,
    RatingCriteriaListingPageModule,
    RatingPageModule,
    RatedCriteriaListPageModule,
    RegistryListPageModule,
    GeneralQuestionListPageModule,
    IonicStepperModule,
    ObservationsPageModule,
    ImprovementProjectPageModule,
    ProgramsPageModule,
    InstitutionPageModule,
    BottomTabPageModule,
    ReportsPageModule,
    LibraryPageModule,
    ManualRatingPageModule,
    FeedbackPollPageModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    HomePage,
    WelcomePage,
    InstitutionsEntityList,
    FaqPage,
    EntityProfileEditPage,
    ImageListingPage,
    SolutionDetailsPage,
    MatrixActionModalPage,
    QuestionDashboardPage,
    RemarksPage,
    FeedbackPage,
    DetailPage,
    AssessmentAboutPage,
    GeneralQuestionPage,
    GeneralQuestionSubmitPage,
    IndividualListingPage,
    ProgramDetailsPage,
    EntityListingPage,
    HintPage,
    PreviewPage,
    SubmissionListPage,
    DashboardPage,
    SettingsPage,
    ObservationReportsPage,
    RoleListingPage,
    ObservationEditPage,
    QuestionListPage,
    TutorialVideoListingPage,
    EvidenceAllListComponent,
    CriteriaListPage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    InAppBrowser,
    AuthProvider,
    FileChooser,

    CurrentUserProvider,
    Network,
    SchoolListProvider,
    // HttpInterceptorProvider,
    // {provide: HTTP_INTERCEPTORS, useClass: HttpInterceptorProvider, multi: true},
    UtilsProvider,
    ApiProvider,
    AndroidPermissions,
    Geolocation,
    Diagnostic,
    Camera,
    File,
    FilePath,
    FileTransfer,
    ImagePicker,
    LocationAccuracy,
    PhotoLibrary,
    RatingProvider,
    NetworkGpsProvider,
    FeedbackProvider,
    EvidenceProvider,
    UpdateLocalSchoolDataProvider,
    Device,
    ExtendedDeviceInformation,
    SlackProvider,
    Keyboard,
    LocalStorageProvider,
    HTTP,
    AssessmentServiceProvider,
    Deeplinks,
    ObservationProvider,
    SocialSharing,
    SharingFeaturesProvider,
    IOSFilePicker,
    FileOpener,
    HintProvider,
    TextToSpeech,
    Media,
    ObservationServiceProvider,
    DownloadAndPreviewProvider,
    UpdateTrackerProvider,
    TextToSpeechProvider,
    NotificationProvider,
    Badge,
    AppIconBadgeProvider,
    FCM,
    FcmProvider,
    LocalNotifications,
    Market,
    AppVersion,
    SpinnerDialog,
    SidemenuProvider,
    ScreenOrientation,
    PhotoViewer,
    StreamingMedia,
    AppAvailability,
  ],
})
export class AppModule {}
export function setTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}
