import { Component } from "@angular/core";
import { NavController, NavParams, Platform } from "ionic-angular";
import { UtilsProvider } from "../../../providers/utils/utils";
import { ApiProvider } from "../../../providers/api/api";
import { AppConfigs } from "../../../providers/appConfig";
import { DashboardPage } from "../../dashboard/dashboard";
import { ReportProgramSolutionPage } from "../report-program-solution/report-program-solution";

/**
 * Generated class for the ProgramListingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: "page-program-listing",
  templateUrl: "program-listing.html",
})
export class ProgramListingPage {
  entity: any;
  programList: any;
  isProgramListAvailable: boolean = false;
  isIos;

  constructor(
    public navCtrl: NavController,
    private platform: Platform,
    public utils: UtilsProvider,
    public navParams: NavParams,
    private apiProvider: ApiProvider
  ) {
    this.entity = this.navParams.get("entity");
    this.isIos = this.platform.is("ios") ? true : false;
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad ProgramListingPage");
    this.getProgramList();
  }
  getProgramList() {
    this.utils.startLoader();
    this.apiProvider.httpPost(
      AppConfigs.reports.programs,
      {
        entityId: this.entity._id,
        entityType: this.entity.entityType,
      },
      (success) => {
        success.data
          ? (this.programList = success.data)
          : (this.programList = []);
        this.utils.stopLoader();
      },
      (error) => {
        this.programList = [];
        this.utils.stopLoader();
        this.utils.openToast(error);
      },
      { baseUrl: "dhiti" }
    );
  }
  // removed this function to report prog solution page
  /* getReportsAccordingToSolution(programId, solutionId, solutionName) {
    this.navCtrl.push(DashboardPage, {
      entity: this.entity,
      programId: programId,
      solutionId: solutionId,
      solutionName: solutionName,
    });
  } */

  goToProgSol(programIndex) {
    let data = {
      programName: this.programList[programIndex].programName,
      programId: this.programList[programIndex].programId,
      entity: this.entity,
    };
    this.navCtrl.push(ReportProgramSolutionPage, {
      data,
    });
  }
}
