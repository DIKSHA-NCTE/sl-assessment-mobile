import { Component } from "@angular/core";
import { NavController, NavParams, ViewController } from "ionic-angular";
import { UtilsProvider } from "../../providers/utils/utils";

/**
 * Generated class for the CriteriaListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: "page-criteria-list",
  templateUrl: "criteria-list.html",
})
export class CriteriaListPage {
  allCriterias: any;
  filteredCriterias: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private viewCntrl: ViewController,
    private utils: UtilsProvider
  ) {}

  ionViewDidLoad() {
    this.allCriterias = this.navParams.get("allCriterias");
    this.filteredCriterias = this.navParams.get("filteredCriterias");
    console.log("ionViewDidLoad CriteriaListPage");
    console.log(this.allCriterias);
    console.log(this.filteredCriterias);
  }

  onCriteriaClick(externalId) {
    if (this.filteredCriterias.includes(externalId)) {
      const indexOfQuestion = this.filteredCriterias.indexOf(externalId);
      this.filteredCriterias.splice(indexOfQuestion, 1);
    } else {
      this.filteredCriterias.push(externalId);
    }
    console.log(JSON.stringify(this.filteredCriterias));
  }

  applyFilter() {
    !this.filteredCriterias.length
      ? this.utils.openToast("Select at least one criteria")
      : this.viewCntrl.dismiss({
          filter: this.filteredCriterias,
          action: "updated",
        });
  }

  close() {
    this.viewCntrl.dismiss({ action: "cancelled" });
  }
}
