import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { LocalStorageProvider } from "../../providers/local-storage/local-storage";
import { UtilsProvider } from "../../providers/utils/utils";
import { RoleListingPage } from "../role-listing/role-listing";
import { ReportEntityListingPage } from "../reports/report-entity-listing/report-entity-listing";

@IonicPage()
@Component({
  selector: "page-dashboard-assessment-listing",
  templateUrl: "dashboard-assessment-listing.html",
})
export class DashboardAssessmentListingPage {
  roles;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private localStorageProvider: LocalStorageProvider,
    private utils: UtilsProvider
  ) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad DashboardAssessmentListingPage");
    this.utils.startLoader();
    this.localStorageProvider
      .getLocalStorage("profileRole")
      .then((success) => {
        this.roles = success;
        this.utils.stopLoader();
      })
      .catch((error) => {
        this.utils.stopLoader();
      });
  }

  onAssessmentClick(type) {
    if (this.roles.roles.length > 1) {
      this.navCtrl.push(RoleListingPage, {
        assessmentType: type,
        from: "dashboard",
      });
    } else {
      this.navCtrl.push(ReportEntityListingPage, {
        currentEntityType: this.roles.roles[0].immediateSubEntityType,
        data: this.roles.roles[0].entities,
        entityType: this.roles.roles[0].entities[0].immediateSubEntityType,
        assessmentType: type,
        from: "dashboard",
      });
    }
  }
}
