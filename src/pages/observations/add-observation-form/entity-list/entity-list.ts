import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { AppConfigs } from '../../../../providers/appConfig';
import { ApiProvider } from '../../../../providers/api/api';
import { UtilsProvider } from '../../../../providers/utils/utils';
import { LocalStorageProvider } from '../../../../providers/local-storage/local-storage';


@Component({
  selector: 'page-entity-list',
  templateUrl: 'entity-list.html',
})
export class EntityListPage {
  entityList;
  observationId;
  searchUrl;
  limit = 50;
  page = 1;
  totalCount = 0;
  searchValue = "";
  selectableList: any = [];
  index: any = 50;
  arr = [];
  selectedListCount = {
    count: 0
  }
  solutionId: any;
  searchQuery;
  allStates: Array<Object>;
  profileMappedState: any;
  isProfileAssignedWithState: boolean;
  profileData: any;
  selectedState;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCntrl: ViewController,
    private apiProviders: ApiProvider,
    private utils: UtilsProvider,
    private localStorage: LocalStorageProvider
  ) {
    this.searchUrl = AppConfigs.cro.searchEntity;
    this.observationId = this.navParams.get('data');
    this.solutionId = this.navParams.get('solutionId');
    this.localStorage.getLocalStorage('profileRole').then(success => {
      this.profileData = success;
      if(success && success.relatedEntities && success.relatedEntities.length){
        for (const entity of success.relatedEntities) {
          if(entity.entityType === 'state'){
            this.profileMappedState = entity._id;
            this.isProfileAssignedWithState = true;
            break
          }
        }
        this.isProfileAssignedWithState =this.profileMappedState ? true : false 
      } else {
        this.isProfileAssignedWithState = false;
      }
      this.getAllStatesFromLocal();
    }).catch(error => {
      this.isProfileAssignedWithState = false;
      this.getAllStatesFromLocal()
    })
    console.log(this.observationId)
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad SchoolListPage');
  }

  getAllStatesFromLocal() {
    this.localStorage.getLocalStorage('allStates').then(data => {
      data ? this.allStates = data : this.getAllStatesApi();
      if(data && data.length){
        this.selectedState = this.profileData.stateSelected ? this.profileData.stateSelected : data[0]._id;
      } ;
    }).catch(error => {
      this.getAllStatesApi();
    })
  }

  getAllStatesApi() {
    this.apiProviders.httpGet(AppConfigs.cro.entityListBasedOnEntityType + 'state', success => {
      this.allStates = success.result;
      if(this.allStates && this.allStates.length){
        this.selectedState = this.profileData.stateSelected ? this.profileData.stateSelected :this.allStates[0]['_id'];
      } 
      this.localStorage.setLocalStorage('allStates', this.allStates);
    }, error => {
      this.allStates = [];
    })
  }
  onStateChange(event) {
    this.profileData.stateSelected = event;
    this.localStorage.setLocalStorage('profileRole', this.profileData);
    this.searchQuery = "";
  }
  addSchools() {
    let selectedSchools = []
    this.selectableList.forEach(element => {
      if (element.selected && !element.preSelected) {
        selectedSchools.push(element);
      }
    });

    console.log(selectedSchools.length);
    this.viewCntrl.dismiss(selectedSchools);
  }
  clearEntity(){
    this.selectableList = []
  }
  cancel() {
    this.viewCntrl.dismiss();
  }
  checkItem(listItem) {
    listItem.selected = !listItem.selected;
    listItem.selected ? this.selectedListCount.count++ : this.selectedListCount.count--;
  }
  search(event?) {
    // this.searchValue = event ? event : this.searchValue;
    !event ? this.utils.startLoader() : "";
    this.page = !event ? 1 : this.page + 1;
    let apiUrl = this.searchUrl +"?observationId="+ this.observationId + "&search=" + encodeURIComponent(this.searchQuery ? this.searchQuery :"") + "&page=" + this.page + "&limit=" + this.limit;
    apiUrl = !this.isProfileAssignedWithState ? (apiUrl+`&parentEntityId=${encodeURIComponent(this.selectedState)}`) : apiUrl;
    this.apiProviders.httpGet(apiUrl, success => {
      this.selectableList = !event ? [] : this.selectableList;
      for (let i = 0; i < success.result[0].data.length; i++) {
        success.result[0].data[i].isSelected = success.result[0].data[i].selected;
        success.result[0].data[i].preSelected = success.result[0].data[i].selected ? true : false;
      }
      this.totalCount = success.result[0].count;
      this.selectableList = [... this.selectableList, ...success.result[0].data]
      !event ? this.utils.stopLoader() : event.complete();
    }, error => {
      !event ? this.utils.stopLoader() : event.complete();
    },{version:"v2"})
  }


  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.search(infiniteScroll);
      // infiniteScroll.complete();
    }, 500);
  }
  searchEntity() {
    // if (!event.value) {
    //   this.selectableList = [];
    //   return
    // }
    // if (!event.value || event.value.length < 3) {
    //   return;
    // }
    this.selectableList = [];
    this.search()
  }
}
