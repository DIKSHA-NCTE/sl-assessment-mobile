import { Component } from "@angular/core";
import { LocalStorageProvider } from "../../../../providers/local-storage/local-storage";
import { AppConfigs } from "../../../../providers/appConfig";
import { ApiProvider } from "../../../../providers/api/api";
import { UtilsProvider } from "../../../../providers/utils/utils";
import { NavParams, ViewController } from "ionic-angular";

/**
 * Generated class for the LibrarayEntityListComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: "libraray-entity-list",
  templateUrl: "libraray-entity-list.html",
})
export class LibrarayEntityListComponent {
  text: string;
  profileData: any;
  profileMappedState: any;
  isProfileAssignedWithState: boolean;
  allStates: any;
  selectedState: any;
  entityListPage = 1;
  entityListLimit = 50;
  searchEntity: string = "";
  solutionId: any;
  entityListTotalCount: any;
  selectAll: any;
  editData: any;
  entityList: any;
  entityCount: number;

  constructor(
    public localStorage: LocalStorageProvider,
    public apiProviders: ApiProvider,
    public utils: UtilsProvider,
    public navParams: NavParams,
    public viewCntrl: ViewController
  ) {
    console.log("Hello LibrarayEntityListComponent Component");
    this.text = "Hello World";
    this.editData = this.navParams.get("editData");
    this.solutionId = this.editData.solutionId;

    this.localStorage
      .getLocalStorage("profileRole")
      .then((success) => {
        this.profileData = success;
        if (
          success &&
          success.relatedEntities &&
          success.relatedEntities.length
        ) {
          for (const entity of success.relatedEntities) {
            if (entity.entityType === "state") {
              this.profileMappedState = entity._id;
              this.isProfileAssignedWithState = true;
              break;
            }
          }
          this.isProfileAssignedWithState = this.profileMappedState
            ? true
            : false;
        } else {
          this.isProfileAssignedWithState = false;
        }
        this.getAllStatesFromLocal();
      })
      .catch((error) => {
        this.isProfileAssignedWithState = false;
        this.getAllStatesFromLocal();
      });
  }

  getAllStatesFromLocal() {
    this.localStorage
      .getLocalStorage("allStates")
      .then((data) => {
        data ? (this.allStates = data) : this.getAllStatesApi();
        if (data && data.length) {
          this.selectedState = this.profileData.stateSelected
            ? this.profileData.stateSelected
            : data[0]._id;
          this.getEntityList();
        }
      })
      .catch((error) => {
        this.getAllStatesApi();
      });
  }

  getAllStatesApi() {
    this.apiProviders.httpGet(
      AppConfigs.cro.entityListBasedOnEntityType + "state",
      (success) => {
        this.allStates = success.result;
        if (this.allStates && this.allStates.length) {
          this.selectedState = this.profileData.stateSelected
            ? this.profileData.stateSelected
            : this.allStates[0]["_id"];
        }
        this.localStorage.setLocalStorage("allStates", this.allStates);
        this.getEntityList();
      },
      (error) => {
        this.allStates = [];
      }
    );
  }

  getEntityList(event?) {
    this.utils.startLoader();
    this.entityListPage = event ? this.entityListPage + 1 : 1;
    let apiUrl =
      AppConfigs.cro.searchEntity +
      "?solutionId=" +
      this.solutionId +
      "&search=" +
      encodeURIComponent(this.searchEntity) +
      "&page=" +
      this.entityListPage +
      "&limit=" +
      this.entityListLimit;
    apiUrl =
      apiUrl +
      `&parentEntityId=${encodeURIComponent(
        this.isProfileAssignedWithState
          ? this.profileMappedState
          : this.selectedState
      )}`;
    this.apiProviders.httpGet(
      apiUrl,
      (success) => {
        this.utils.stopLoader();
        this.entityListTotalCount = success.result[0].count;
        if (this.editData && this.editData.entities.length) {
          success.result[0].data.forEach((element) => {
            element["selected"] = this.editData.entities.includes(element._id)
              ? true
              : false;
          });
        } else {
          success.result[0].data.forEach((element) => {
            element["selected"] = this.selectAll ? true : false;
          });
        }
        const previousEntityList = this.entityList
          ? JSON.parse(JSON.stringify(this.entityList))
          : [];
        this.entityList = event
          ? [...previousEntityList, ...success.result[0].data]
          : success.result[0].data;
        this.entityCount = 0;
        this.entityList.forEach((element) => {
          element.selected ? this.entityCount++ : this.entityCount;
        });
        console.log(this.entityCount, this.entityListTotalCount);
        this.entityCount != 0 && this.entityCount == this.entityListTotalCount
          ? (this.selectAll = true)
          : false;
      },
      (error) => {
        this.utils.stopLoader();
      },
      { version: "v2" }
    );
    return true;
  }

  onStateChange(event) {
    this.profileData.stateSelected = event;
    this.editData.entities = [];
    this.localStorage.setLocalStorage("profileRole", this.profileData);
  }

  countEntity(entity) {
    entity.selected ? this.entityCount-- : this.entityCount++;
  }

  selectUnselectAllEntity(status) {
    for (const entity of this.entityList) {
      entity["selected"] = status;
    }
    this.entityCount = status ? this.entityList.length : 0;
    this.selectAll = status;
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.getEntityList(infiniteScroll);
    }, 500);
  }

  cancel() {
    this.viewCntrl.dismiss(this.editData.entities.length ? null : []);
  }

  addSchools() {
    this.viewCntrl.dismiss(this.entityList);
  }

  searchEntities(event) {
    if (!event.value) {
      this.clearEntity();
      return;
    }
    if (!event.value || event.value.length < 3) {
      return;
    }
    this.searchEntity = event.value;
    this.getEntityList();
  }

  clearEntity() {
    this.searchEntity = "";
    this.getEntityList();
  }
}
