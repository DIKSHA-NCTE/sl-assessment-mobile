import { EvidenceAllListComponent } from './../../components/evidence-all-list/evidence-all-list';
import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, App, Events, Platform, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { CurrentUserProvider } from '../../providers/current-user/current-user';
import { ApiProvider } from '../../providers/api/api';
import { AppConfigs } from '../../providers/appConfig';
import { UtilsProvider } from '../../providers/utils/utils';
import { ImageListingPage } from '../image-listing/image-listing';
import { Diagnostic } from '@ionic-native/diagnostic';
import { NetworkGpsProvider } from '../../providers/network-gps/network-gps';
import { FeedbackProvider } from '../../providers/feedback/feedback';
import { Network } from '@ionic-native/network';
import { LocalStorageProvider } from '../../providers/local-storage/local-storage';
import { TranslateService } from '@ngx-translate/core';
import { PreviewPage } from '../preview/preview';
import { ObservationReportsPage } from '../observation-reports/observation-reports';
import { UpdateTrackerProvider } from '../../providers/update-tracker/update-tracker';

@IonicPage()
@Component({
  selector: 'page-section-list',
  templateUrl: 'section-list.html',
})
export class SectionListPage {

  evidenceSections: any;
  entityName: string;
  submissionId: any;
  selectedEvidenceIndex: any;
  selectedEvidenceName: string;
  sectionData: any;
  allAnsweredForEvidence: boolean;
  userData: any;
  currentEvidence: any;
  networkAvailable: any;
  isIos: boolean = this.platform.is('ios');
  recentlyUpdatedEntity: any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private storage: Storage, private appCtrl: App,
    private currentUser: CurrentUserProvider,
    private apiService: ApiProvider, private utils: UtilsProvider,
    private diagnostic: Diagnostic, private ngps: NetworkGpsProvider,
    private feedback: FeedbackProvider,
    private translate: TranslateService,
    private events: Events, private platform: Platform,
    private updateTracker : UpdateTrackerProvider,
    private alertCtrl: AlertController, private network: Network, private localStorage: LocalStorageProvider) {
      
    this.events.subscribe('network:offline', () => {
      this.networkAvailable = false;
    });
   
    // Online event
    this.events.subscribe('network:online', () => {
      this.networkAvailable = true;
    });
    this.networkAvailable = this.ngps.getNetworkStatus()
    
  }

 
  ionViewWillEnter() {
  
    this.utils.startLoader();
    this.userData = this.currentUser.getCurrentUserData();
    
    this.submissionId = this.navParams.get('_id');
    this.entityName = this.navParams.get('name');
    this.selectedEvidenceIndex = this.navParams.get('selectedEvidence');
    this.recentlyUpdatedEntity = this.navParams.get('recentlyUpdatedEntity');
    
    this.localStorage.getLocalStorage(this.utils.getAssessmentLocalStorageKey(this.submissionId)).then(data => {
      this.sectionData = data;
      let assessmentDetails = this.updateTracker.getLastModifiedInSection(data,this.selectedEvidenceIndex ,this.submissionId,this.recentlyUpdatedEntity);
      this.currentEvidence = assessmentDetails['assessment']['evidences'][this.selectedEvidenceIndex];
      // console.log(JSON.stringify(this.currentEvidence))
      this.evidenceSections = this.currentEvidence['sections'];
      this.selectedEvidenceName = this.currentEvidence['name'];
      this.checkForEvidenceCompletion();
      this.utils.stopLoader();
    }).catch(error => {
      this.utils.stopLoader();
    })
    // this.storage.get('schoolsDetails').then(data => {
    //   this.schoolData = JSON.parse(data);
    //   this.currentEvidence = this.schoolData[this.schoolId]['assessments'][0]['evidences'][this.selectedEvidenceIndex];
    //   this.evidenceSections = this.schoolData[this.schoolId]['assessments'][0]['evidences'][this.selectedEvidenceIndex]['sections'];
    //   this.selectedEvidenceName = this.schoolData[this.schoolId]['assessments'][0]['evidences'][this.selectedEvidenceIndex]['name'];
    //   this.checkForEvidenceCompletion();
    //   this.utils.stopLoader();
    // }).catch(error => {
    //   this.utils.stopLoader();
    // })
  }

  ionViewDidLoad() {
    this.diagnostic.isLocationEnabled().then(success => {
      this.ngps.checkForLocationPermissions();
    }).catch(error => {

    })
     
  }


  checkForEvidenceCompletion(): void {
    let allAnswered;
    for (const section of this.evidenceSections) {
      allAnswered = true;
      for (const question of section.questions) {
        // if( question.responseType === 'pageQuestions'){
        //   for (const questions of question.pageQuestions){
        //       if(!questions.isCompleted){
        //         allAnswered = false
        //         break;
        //       }
        //       // break;
        //     }    
        //     break;    
        // }else  
        if (!question.isCompleted) {
          allAnswered = false;
          break;
        }
      }
      if (this.currentEvidence.isSubmitted) {
        section.progressStatus = 'submitted';
      } else if (!this.currentEvidence.startTime) {
        section.progressStatus = '';
      } else if (allAnswered) {
        section.progressStatus = 'completed';
      } else if (!allAnswered && section.progressStatus) {
        section.progressStatus = 'inProgress';
      } else if (!section.progressStatus) {
        section.progressStatus = '';
      }
    }
    this.allAnsweredForEvidence = true;
    for (const section of this.evidenceSections) {
      if (section.progressStatus !== 'completed') {
        this.allAnsweredForEvidence = false;
        break;
      }
    }
    this.localStorage.setLocalStorage(this.utils.getAssessmentLocalStorageKey(this.submissionId), this.sectionData)
  }

  goToQuestioner(selectedSection): void {
    // console.log(this.submissionId + "sectionlist")
    const params = {
      _id: this.submissionId,
      name: this.entityName,
      selectedEvidence: this.selectedEvidenceIndex,
      selectedSection: selectedSection
    };
    // this.appCtrl.getRootNav().push('QuestionerPage', params);
    if (!this.evidenceSections[selectedSection].progressStatus) {
      this.evidenceSections[selectedSection].progressStatus = this.currentEvidence.startTime ? 'inProgress' : '';
      // this.utils.setLocalSchoolData(this.schoolData)
      this.localStorage.setLocalStorage(this.utils.getAssessmentLocalStorageKey(this.submissionId), this.sectionData)

    }
    this.navCtrl.push('QuestionerPage', params);
  }

  checkForNetworkTypeAlert() {
    if (this.network.type !== ('3g' || '4g' || 'wifi')) {
      let translateObject;
      this.translate.get(['actionSheet.confirm', 'actionSheet.yes', 'actionSheet.no', 'actionSheet.slowInternet']).subscribe(translations => {
        translateObject = translations;
        // console.log(JSON.stringify(translations))
      })
      let alert = this.alertCtrl.create({
        title: translateObject['actionSheet.confirm'],
        message: translateObject['actionSheet.slowInternet'],
        buttons: [
          {
            text: translateObject['actionSheet.no'],
            role: 'cancel',
            handler: () => {
              //console.log('Cancel clicked');
            }
          },
          {
            text: translateObject['actionSheet.yes'],
            handler: () => {
              this.goToImageListing()
            }
          }
        ]
      });
      alert.present();
    }
  }

  viewReport() {
    this.navCtrl.push(ObservationReportsPage, { submissionId: this.submissionId })
  }
 


  goToImageListing() {
    if (this.networkAvailable) {
      this.diagnostic
        .isLocationAuthorized()
        .then((authorized) => {
           if (!AppConfigs.enableGps) {
             return true;
           }
          if (authorized) {
            return this.diagnostic.isLocationEnabled();
          } else {
            this.utils.openToast("Please enable location permission to continue.");
          }
        })
        .then((success) => {
          if (success) {
            const params = {
              selectedEvidenceId: this.currentEvidence._id,
              _id: this.submissionId,
              name: this.entityName,
              selectedEvidence: this.selectedEvidenceIndex,
            };
            this.navCtrl.push(ImageListingPage, params);
          } else {
            this.ngps.checkForLocationPermissions();
          }
        })
        .catch((error) => {
          this.ngps.checkForLocationPermissions();
        });
    } else {
      this.translate.get('toastMessage.connectToInternet').subscribe(translations => {
        this.utils.openToast(translations);
      })
    }


  }

  submitEvidence() {
    const payload = this.constructPayload();
    //console.log(JSON.stringify(payload));

    const submissionId = this.sectionData['assessment'][0].submissionId;
    const url = AppConfigs.survey.submission + submissionId;
    if (this.networkAvailable) {
      this.apiService.httpPost(url, payload, response => {
        this.utils.openToast(response.message);
        this.sectionData['assessment'][0]['evidences'][this.selectedEvidenceIndex].isSubmitted = true;
        // this.utils.setLocalSchoolData(this.schoolData);
        this.localStorage.setLocalStorage(this.utils.getAssessmentLocalStorageKey(this.submissionId), this.sectionData)

        // //console.log(JSON.stringify(response))
      }, error => {
        //console.log(JSON.stringify(error))
      })
    } else {
      this.translate.get('toastMessage.networkConnectionForAction').subscribe(translations => {
        this.utils.openToast(translations);
      })
    }

    // //console.log(JSON.stringify(this.constructPayload()));

  }

  constructPayload() {
    const payload = {
      'schoolProfile': {},
      'evidence': {}
    }
    const schoolProfile = {};
    const evidence = {
      id: "",
      externalId: "",
      answers: []
    };
    for (const field of this.sectionData['schoolProfile']['form']) {
      schoolProfile[field.field] = field.value
    }
    // schoolProfile['updatedBy'] =  this.userData.sub;
    schoolProfile['updatedDate'] = Date.now();

    evidence.id = this.sectionData['assessment']['evidences'][this.selectedEvidenceIndex]._id;
    evidence.externalId = this.sectionData['assessment']['evidences'][this.selectedEvidenceIndex].externalId;

    for (const section of this.evidenceSections) {
      for (const question of section.questions) {
        const obj = {
          qid: question._id,
          value: question.value,
          remarks: question.remarks
        };
        evidence.answers.push(obj);
      }
    }
    payload.schoolProfile = schoolProfile;
    payload.evidence = evidence;
    return payload
  }

  feedBack() {
    this.feedback.sendFeedback()
  }


  ionViewWillLeave() {
    if (this.navParams.get('parent')) {
      this.navParams.get('parent').onInit();
    }
  }

  previewSubmission() {
    this.submissionId = this.navParams.get('_id');
    this.entityName = this.navParams.get('name');
    this.selectedEvidenceIndex = this.navParams.get('selectedEvidence');
    this.navCtrl.push(PreviewPage, { _id: this.submissionId, name: this.entityName, selectedEvidence: this.selectedEvidenceIndex })
  }
}
