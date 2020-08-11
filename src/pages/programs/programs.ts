import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { ApiProvider } from "../../providers/api/api";
import { UtilsProvider } from "../../providers/utils/utils";
import { AppConfigs } from "../../providers/appConfig";
import { LocalStorageProvider } from "../../providers/local-storage/local-storage";
import { ProgramServiceProvider } from "./program-service";
import { ProgramSolutionPage } from "./program-solution/program-solution";
import { error } from "highcharts";

/**
 * Generated class for the ProgramsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-programs",
  templateUrl: "programs.html",
})
export class ProgramsPage {
  programList: any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private localStorage: LocalStorageProvider,
    private programService: ProgramServiceProvider,
    private utils: UtilsProvider
  ) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad ProgramsPage");
    this.utils.startLoader();
    this.programService
      .getProgramFromStorage()
      .then((programs) => {
        this.programList = programs;
        this.utils.stopLoader();
      })
      .catch((error) => {
        this.programList = null;
        this.utils.stopLoader();
      });
  }

  goToProgramSol(programIndex) {
    this.navCtrl.push(ProgramSolutionPage, {
      programIndex: programIndex,
    });
  }

  refreshLocalObservationList(refreshEvent?) {
    !refreshEvent ? this.utils.startLoader() : null;

    this.programService
      .refreshObservationList(this.programList, event)
      .then((programs) => {
        this.programList = programs;
        if (refreshEvent) refreshEvent.complete();
        else this.utils.stopLoader();
      })
      .catch((error) => {
        this.utils.stopLoader();
      });
  }
}
