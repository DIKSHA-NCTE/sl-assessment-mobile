import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActionSheetController, App, AlertController, ModalController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { UtilsProvider } from '../utils/utils';
import { Diagnostic } from '@ionic-native/diagnostic';
import { NetworkGpsProvider } from '../network-gps/network-gps';
import { AppConfigs } from '../appConfig';
import { ApiProvider } from '../api/api';
import { RemarksPage } from '../../pages/remarks/remarks';
import { LocalStorageProvider } from '../local-storage/local-storage';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class EvidenceProvider {
  schoolData: any;
  entityDetails: any;
  schoolId: any;
  evidenceIndex: any;

  constructor(public http: HttpClient, private actionSheet: ActionSheetController,
    private appCtrl: App, private storage: Storage, private utils: UtilsProvider,
    private diagnostic: Diagnostic, private translate : TranslateService,
    private netwrkGpsProvider: NetworkGpsProvider, private localStorage: LocalStorageProvider,
    private apiService: ApiProvider, private alertCtrl: AlertController, private modalCtrl: ModalController) {
    console.log('Hello EvidenceProvider Provider');
    this.storage.get('schools').then(data => {
      this.schoolData = data;
    })
  }

  openActionSheet(params,type?): void {
    type = type ? type : "Survey";
    console.log(JSON.stringify(params) +  " test")
    this.entityDetails = params.entityDetails;
    this.schoolId = params._id;
    this.evidenceIndex = params.selectedEvidence;
    const selectedECM =  this.entityDetails['assessment']['evidences'][this.evidenceIndex] ;
    let translateObject ;
    this.translate.get(['actionSheet.surveyAction','actionSheet.view','actionSheet.start','actionSheet.ecmNotApplicable','actionSheet.cancel','actionSheet.ecmNotAllowed']).subscribe(translations =>{
      translateObject = translations;
      console.log(JSON.stringify(translations))
    let action = this.actionSheet.create(
      {
      title: translateObject['actionSheet.surveyAction'],
      buttons: [
        {
          text: translateObject['actionSheet.start']+" "+type,
          icon: 'arrow-forward',
          handler: () => {
            this.diagnostic.isLocationAuthorized()
              .then(authorized => {
                if (authorized) {
                  return this.diagnostic.isLocationEnabled();
                } else {
                  this.utils.openToast("Please enable location permission to continue.");
                }
              })
              .then(success => {
                if (success) {
                // if(params.entityDetails['assessment']) {
                //   params.entityDetails['assessments']['evidences'][params.selectedEvidence].startTime = Date.now();
                // } else {
                  params.entityDetails['assessment']['evidences'][params.selectedEvidence].startTime = Date.now();
                // }
                //  ?  :  = ;
                // this.utils.setLocalSchoolData(params.entityDetails);
                this.localStorage.setLocalStorage(this.utils.getAssessmentLocalStorageKey(this.schoolId), params.entityDetails)
                delete params.entityDetails;
                this.appCtrl.getRootNav().push('SectionListPage', params);
              } else {
                this.netwrkGpsProvider.checkForLocationPermissions();
              }
            }).catch(error => {
              this.netwrkGpsProvider.checkForLocationPermissions();
            })
          }
        },
        {
          text:translateObject['actionSheet.view']+" "+type,
          icon: "eye",
          handler: () => {
            delete params.entityDetails;
            this.appCtrl.getRootNav().push('SectionListPage', params);
          }
        },
        {
          text: selectedECM.canBeNotApplicable ? translateObject['actionSheet.ecmNotApplicable'] : translateObject['actionSheet.cancel'],
          role: !selectedECM.canBeNotApplicable ? 'destructive' : "",
          icon: selectedECM.canBeNotApplicable ? "alert" : "",
          handler: () => {
            if (selectedECM.canBeNotApplicable) {
              this.openAlert(selectedECM);
              // this.notApplicable(selectedECM);
            }
          }
        }
      ]
    })
    // console.dir(action);
     const notAvailable =({
      text: translateObject['actionSheet.ecmNotAllowed'],
      icon: "alert",
      handler: () => {
        delete params.entityDetails;
        this.openAlert(selectedECM)
      }
    })
    if(selectedECM.canBeNotAllowed) {
      action.data.buttons.splice(action.data.buttons.length-1, 0 , notAvailable);
    }
    // if(selectedECM.canBeNotApplicable) {
    //   action['buttons'].push(
    // {
    //   text: "ECM Not Applicable",
    //   icon: "alert",
    //   handler: () => {
    //     this.notApplicable(params);
    //   }
    // }
    //   )
    // }
    
    action.present();
  })

  }

  openRemarksModal(selectedECM): void {
    const modal = this.modalCtrl.create(RemarksPage, {data: selectedECM, button:"submit", required: true});
    modal.onDidDismiss( remarks => {
      if(remarks) {
        selectedECM.remarks = remarks;
        this.notApplicable(selectedECM)
      }
    })
    modal.present();
  }

  openAlert(selectedECM): void {
    let translateObject ;
          this.translate.get(['actionSheet.confirm','actionSheet.cancel','actionSheet.confirm','actionSheet.ecmNotApplicableMessage']).subscribe(translations =>{
            translateObject = translations;
            console.log(JSON.stringify(translations))
          })
    let alert = this.alertCtrl.create({
      title: translateObject['actionSheet.confirm'],
      message: translateObject['actionSheet.ecmNotApplicableMessage'],
      buttons: [
        {
          text: translateObject['actionSheet.cancel'],
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text:translateObject['actionSheet.confirm'],
          handler: () => {
            // console.log('Buy clicked');
            // this.notApplicable(selectedECM);
            this.openRemarksModal(selectedECM);
          }
        }
      ]
    });
    alert.present();
  }

  notApplicable(selectedECM) {
    this.utils.startLoader()
    const payload = this.constructPayload(selectedECM);
    const submissionId = this.entityDetails['assessment'].submissionId;
    const url = AppConfigs.survey.submission + submissionId;
    this.apiService.httpPost(url, payload, response => {
      console.log(JSON.stringify(response));
      this.utils.openToast(response.message);
      this.entityDetails['assessment']['evidences'][this.evidenceIndex].isSubmitted = true;
      this.entityDetails['assessment']['evidences'][this.evidenceIndex].notApplicable = true;
      this.localStorage.setLocalStorage(this.utils.getAssessmentLocalStorageKey(this.schoolId), this.entityDetails)
      // this.utils.setLocalSchoolData(this.entityDetails);
      this.utils.stopLoader();

    }, error => {
      this.utils.stopLoader();
    })
  }

  constructPayload(selectedECM): any {
    console.log("in construct")
    const payload = {
      // 'schoolProfile': {},
      'evidence': {}
    }
    // const schoolProfile = {};
    const evidence = {
      id: "",
      externalId: "",
      answers: {},
      startTime: 0,
      endTime: 0,
      notApplicable: true
    };

    const currentEvidence = selectedECM;
    evidence.id = currentEvidence._id;
    evidence.externalId = currentEvidence.externalId;
    evidence.startTime = Date.now();
    evidence.endTime = Date.now();
    for (const section of selectedECM.sections) {
      for (const question of section.questions) {
        let obj = {
          qid: question._id,
          value: question.responseType === 'matrix' ? this.constructMatrixObject(question, evidence.endTime) : question.value,
          remarks: question.remarks,
          fileName: question.fileName,
          notApplicable: true,
          startTime: evidence.endTime,
          endTime: evidence.endTime,
          payload: {
            question: question.question,
            labels: [],
            responseType: question.responseType,
            // notApplicable: true,
          }
        };
        // if (question.responseType === 'multiselect') {
        //   for (const val of question.value) {
        //     for (const option of question.options) {
        //       if (val === option.value && obj.payload.labels.indexOf(option.label) <= 0) {
        //         obj.payload.labels.push(option.label);
        //       }
        //     }
        //   }

        // } else if (question.responseType === 'radio') {
        //   for (const option of question.options) {
        //     if (obj.value === option.value && obj.payload.labels.indexOf(option.label) <= 0) {
        //       obj.payload.labels.push(option.label);
        //     }
        //   }
        // } else {
        //   obj.payload.labels.push(question.value);
        // }

        for (const key of Object.keys(question.payload)) {
          obj[key] = question.payload[key];
        }
        evidence.answers[obj.qid] = obj;
      }
    }
    // payload.schoolProfile = schoolProfile;
    payload.evidence = evidence;
    return payload
  }

  constructMatrixObject(question, evidenceEndTime) {
    const value = [];
    for (const instance of question.value) {
      let eachInstance = {};
      for (let qst of instance) {
        const obj1 = {
          qid: qst._id,
          value: qst.value,
          remarks: qst.remarks,
          fileName: qst.fileName,
          notApplicable: true,
          startTime: evidenceEndTime,
          endTime: evidenceEndTime,
          payload: {
            question: qst.question,
            labels: [],
            responseType: qst.responseType
          }
        }
        // if (qst.responseType === 'multiselect') {
        //   for (const val of qst.value) {
        //     for (const option of qst.options) {
        //       if (val === option.value && obj1.payload.labels.indexOf(option.label) <= 0) {
        //         obj1.payload.labels.push(option.label);
        //       }
        //     }
        //   }

        // } else if (qst.responseType === 'radio') {
        //   for (const option of qst.options) {
        //     if (obj1.value === option.value && obj1.payload.labels.indexOf(option.label) <= 0) {
        //       obj1.payload.labels.push(option.label);
        //     }
        //   }
        // } else {
        //   obj1.payload.labels.push(qst.value);
        // }

        for (const key of Object.keys(qst.payload)) {
          obj1[key] = qst.payload[key];
        }
        eachInstance[obj1.qid] = obj1;
      }
      value.push(eachInstance)
    }
    return value
  }


}