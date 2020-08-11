import { Component } from "@angular/core";
import { NavController, NavParams } from "ionic-angular";
import { LocalStorageProvider } from "../../../providers/local-storage/local-storage";
import { UtilsProvider } from "../../../providers/utils/utils";
import { storageKeys } from "../../../providers/storageKeys";

/**
 * Generated class for the ProgramSolutionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: "page-program-solution",
  templateUrl: "program-solution.html",
})
export class ProgramSolutionPage {
  programIndex: any;
  program: any;
  programList: any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private localStorage: LocalStorageProvider,
    private utils: UtilsProvider
  ) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad ProgramSolutionPage");
    this.programIndex = this.navParams.get("programIndex");
    this.getProgramFromStorage();
  }

  getProgramFromStorage() {
    this.utils.startLoader();

    this.localStorage
      .getLocalStorage(storageKeys.programList)
      .then((data) => {
        if (data) {
          console.log(JSON.stringify(data))
          this.program = data[this.programIndex];
          this.programList = data;
        } else {
          this.program = null;
        }
        this.utils.stopLoader();
      })
      .catch((error) => {
        this.utils.stopLoader();
        this.program = null;
      });
  }
}
