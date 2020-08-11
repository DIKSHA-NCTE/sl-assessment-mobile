import { Component } from "@angular/core";
import { NavController, NavParams, App } from "ionic-angular";
import { LocalStorageProvider } from "../../providers/local-storage/local-storage";
import { UtilsProvider } from "../../providers/utils/utils";
import { ReportEntityListingPage } from "../reports/report-entity-listing/report-entity-listing";

/**
 * Generated class for the RoleDashboardPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: "page-role-listing",
  templateUrl: "role-listing.html",
})
export class RoleListingPage {
  roles = [];
  entityType: any;
  assessmentType;
  from: any;

  constructor(
    public navCtrl: NavController,
    private utils: UtilsProvider,
    private localStorageProvider: LocalStorageProvider,
    public navParams: NavParams,
    public app: App
  ) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad RoleListingPage");
    this.from = this.navParams.get("from");
    this.utils.startLoader();
    this.localStorageProvider
      .getLocalStorage("profileRole")
      .then((success) => {
        this.roles = success.roles;
        console.log(this.roles);
        // this.assessmentType = this.navParams.get("assessmentType");
        // this.entityType = success.result.roles.entityType
        console.log(JSON.stringify(success));
        this.utils.stopLoader();
      })
      .catch((error) => {
        this.utils.stopLoader();
      });
  }
  roleSelected(role) {
    this.navCtrl.push(ReportEntityListingPage, {
      currentEntityType: role.immediateSubEntityType,
      data: role.entities,
      entityType: role.entities[0].immediateSubEntityType,
      // assessmentType: this.assessmentType,
      from: this.from,
    });
  }
}
