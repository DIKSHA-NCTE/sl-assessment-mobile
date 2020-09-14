import { Component } from "@angular/core";
import { LocalStorageProvider } from "../../providers/local-storage/local-storage";
import { ApiProvider } from "../../providers/api/api";
import { AppConfigs } from "../../providers/appConfig";
import { ViewController, NavParams } from "ionic-angular";
import { UtilsProvider } from "../../providers/utils/utils";

/**
 * Generated class for the StateModalComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: "state-modal",
  templateUrl: "state-modal.html",
})
export class StateModalComponent {
  text: string;
  entityList: any;
  editData: any;
  selectAll: any;

  constructor(
    public localStorage: LocalStorageProvider,
    public apiProviders: ApiProvider,
    public viewCntrl: ViewController,
    public navParams: NavParams,
    public utils: UtilsProvider
  ) {
    console.log("Hello StateModalComponent Component");
    this.text = "Hello World";
    this.editData = this.navParams.get("editData");
    this.getAllStatesFromLocal();
  }

  getAllStatesFromLocal() {
    this.localStorage
      .getLocalStorage("allStates")
      .then((data) => {
        data ? (this.entityList = data) : this.getAllStatesApi();
        if (this.editData && this.editData.entities.length) {
          this.entityList.forEach((element) => {
            element["selected"] = this.editData.entities.includes(element._id) ? true : false;
          });
        } else {
          this.entityList.forEach((element) => {
            element["selected"] = this.selectAll ? true : false;
          });
        }
      })
      .catch((error) => {
        this.getAllStatesApi();
      });
  }

  getAllStatesApi() {
    this.utils.startLoader();
    this.apiProviders.httpGet(
      AppConfigs.cro.entityListBasedOnEntityType + "state",
      (success) => {
        this.utils.stopLoader();

        const allStates = success.result;
        this.entityList = allStates;
        this.localStorage.setLocalStorage("allStates", allStates);
        if (this.editData && this.editData.entities.length) {
          this.entityList.forEach((element) => {
            element["selected"] = this.editData.entities.includes(element._id) ? true : false;
          });
        } else {
          this.entityList.forEach((element) => {
            element["selected"] = this.selectAll ? true : false;
          });
        }
      },
      (error) => {
        this.utils.stopLoader();

        this.entityList = [];
      }
    );
  }

  countEntity(entity) {}

  addSchools() {
    this.viewCntrl.dismiss(this.entityList);
  }
  cancel() {
    this.viewCntrl.dismiss();
  }

  selectUnselectAllEntity(status) {
    for (const entity of this.entityList) {
      entity["selected"] = status;
    }
    // this.entityCount = status ? this.entityList.length : 0;
    this.selectAll = status;
  }
}
