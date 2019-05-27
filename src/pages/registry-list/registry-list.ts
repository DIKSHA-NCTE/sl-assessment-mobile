import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { RegistryFormPage } from '../registry-form/registry-form';
import { NetworkGpsProvider } from '../../providers/network-gps/network-gps';
import { UtilsProvider } from '../../providers/utils/utils';
import { ApiProvider } from '../../providers/api/api';
import { AppConfigs } from '../../providers/appConfig';
import { LocalStorageProvider } from '../../providers/local-storage/local-storage';

@IonicPage()
@Component({
  selector: 'page-registry-list',
  templateUrl: 'registry-list.html',
})
export class ParentsListPage {

  entityId: string;
  entityName: string;
  programId: string;
  entityDetails: any;
  registryList: any;
  showUploadBtn: boolean;
  networkConnected: boolean;
  registryType: string;
  submissionId: any;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private storage: Storage,
    private modalCntrl: ModalController,
    private ngps: NetworkGpsProvider,
    private utils: UtilsProvider,
    private localStorage: LocalStorageProvider,
    private apiService: ApiProvider,
    private events: Events, ) {
    this.events.subscribe('network:offline', () => {
      this.networkConnected = false;
    });

    // Online event
    this.events.subscribe('network:online', () => {
      this.networkConnected = true;
    });
    this.networkConnected = this.ngps.getNetworkStatus()
  }

  ionViewDidLoad() {

    console.log('ionViewDidLoad ParentsListPage');
    this.entityId = this.navParams.get('_id');
    this.submissionId = this.navParams.get('submissionId');
    this.entityName = this.navParams.get('name');
    this.registryType = this.navParams.get('registry');
    // this.entityId = this.navParams.get('entityId');
    this.utils.startLoader();
    this.localStorage.getLocalStorage(this.utils.getAssessmentLocalStorageKey(this.entityId)).then(entityDetails => {
      if (entityDetails) {
        this.entityDetails = entityDetails;
        this.showUploadBtn = this.checkForUploadBtn();
      }
    }).catch(error => {

    })

    this.storage.get(this.registryType + 'Details_' + this.entityId).then(registryData => {
      if (registryData) {
        this.utils.stopLoader();
        this.registryList = registryData ? registryData : [];
        this.showUploadBtn = this.checkForUploadBtn();
      } else {
        this.getRegistryList();
        this.getRegistryForm();
        
      }
    })

  }

  refreshParentListClick(event) {
    if (this.networkConnected) {
      if (this.showUploadBtn) {
        this.uploadAndRefresh(event);
      } else {
        this.utils.startLoader("Please wait while refreshing");
        this.apiService.httpGet(AppConfigs.registry.getRegisterList+this.entityId+"?type="+this.registryType, success => {
          this.registryList = success.result ? success.result : [];

          this.showUploadBtn = false;
          for (const item of success.result) {
            item.uploaded = true;
          }
          if (event) {
            event.complete();
          }
          this.localStorage.setLocalStorage(this.registryType + 'Details_' + this.entityId, this.registryList);

          this.utils.stopLoader();

        }, error => {
          if (event) {
            event.complete();
          }
          this.utils.stopLoader();
        })
      }
    } else {
      event.complete();
      this.utils.openToast("You need network connection for this action.");
    }
  }


  uploadAndRefresh(event?: any) {
    const key = this.registryType;
    const obj = {
      [key]: []
    };
    for (const item of this.registryList) {
      if (item.uploaded === false) {
        delete item.uploaded;
        obj[key].push(item);
      }
    }
    this.utils.startLoader('Please wait while refreshing');
    if (this.networkConnected) {
      this.apiService.httpPost(AppConfigs.registry.addEntityInfo+key , obj, success => {
        // this.makeAllAsUploaded();
        this.apiService.httpGet(AppConfigs.registry.getRegisterList+this.entityId+"?type="+this.registryType , success => {
          this.registryList = success.result ? success.result : [];
          this.showUploadBtn = false;
          for (const item of success.result) {
            item.uploaded = true;
          }
          this.localStorage.setLocalStorage(this.registryType + 'Details_' + this.entityId, this.registryList);
          this.utils.stopLoader();
          if (event) {
            event.complete();
          }
        }, error => {
          this.utils.stopLoader();
          if (event) {
            event.complete();
          }
        })
      }, error => {
        if (event) {
          event.complete();
        }
        this.utils.stopLoader();
        this.utils.openToast(error.message);
      })
    } else {
      this.utils.openToast("You need network connection for this action.");
    }
  }



  getRegistryList(event?: any) {
    const url =AppConfigs.registry.getRegisterList+this.entityId+"?type="+this.registryType ;
    console.log(url);

    this.apiService.httpGet(url, success => {
      console.log("registery list function called");
      this.registryList = success.result ? success.result : [];
      this.localStorage.setLocalStorage(this.registryType + 'Details_' + this.entityId, this.registryList)
      this.showUploadBtn = false;
      for (const item of success.result) {
        item.uploaded = true;
      }
      this.utils.stopLoader();
    }, error => {
      this.utils.stopLoader();
    })
  }

  getRegistryForm() {
    const url = AppConfigs.registry.getRegisterForm+this.registryType;
    console.log(url);
    this.apiService.httpGet(url, success => {
      this.localStorage.setLocalStorage(this.registryType + 'RegisterForm', success.result)
    }, error => {
    })
  }

  addRegistryItem(): void {
    console.log(this.entityName + "entity name")
    const params = {
      submissionId : this.submissionId,
      _id: this.entityId,
      name: this.entityName,
      registryType: this.registryType,
      
    }
    let registryForm = this.modalCntrl.create(RegistryFormPage, params);
    registryForm.onDidDismiss(data => {
      if (data) {
        // data.programId = this.entityDetails['program']._id;
        console.log("Dismiss with valid data")
        data.entityId = this.entityId;
        data.entityName = this.entityName;
        this.registryList.push(data);
        this.showUploadBtn = this.checkForUploadBtn();
        this.localStorage.setLocalStorage(this.registryType + 'Details_' + this.entityId, this.registryList)
      }
    })
    registryForm.present();
  }

  updateAllParents() {
    const key = this.registryType;
    const obj = {
      [key]: []
    };
    for (const item of this.registryList) {
      if (item.uploaded === false) {
        delete item.uploaded;
        obj[key].push(item);
      }
    }
    if (this.networkConnected) {
      this.utils.startLoader();
      this.apiService.httpPost(AppConfigs.registry['add' + this.registryType + 'Info'], obj, success => {
        this.utils.stopLoader();
        this.utils.openToast(success.message);
        this.makeAllAsUploaded();
      }, error => {
        this.utils.stopLoader();
        this.utils.openToast(error.message);

      })
    } else {
      this.utils.openToast("You need network connection for this action.");
    }
  }

  makeAllAsUploaded(): void {
    for (const item of this.registryList) {
      item.uploaded = true;
    }
    this.showUploadBtn = this.checkForUploadBtn();
    this.localStorage.setLocalStorage(this.registryType + 'Details_' + this.entityId, this.registryList)
  }

  checkForUploadBtn() {
    if (this.registryList && this.registryList.length) {
      for (const item of this.registryList) {
        if (!item.uploaded) {
          return true
        }
      }
      return false
    }

  }

}
