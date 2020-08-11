import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { ApiProvider } from "../../providers/api/api";
import { AppConfigs } from "../../providers/appConfig";
import { UtilsProvider } from "../../providers/utils/utils";
import { ObservationReportsPage } from "../observation-reports/observation-reports";
import { ActionSheetController } from "ionic-angular";

@IonicPage()
@Component({
  selector: "page-observation-listing",
  templateUrl: "observation-listing.html",
})
export class ObservationListingPage {
  entityDetails;
  solutionType = "my";
  solutionList = [];
  from: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private utils: UtilsProvider,
    private apiProvide: ApiProvider,
    public actionSheetCtrl: ActionSheetController
  ) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad ObservationListingPage");
    this.entityDetails = this.navParams.get("entity");
    this.from = this.navParams.get("from");
    this.entityDetails ? this.getObservationList() : null;
  }

  onTabChange(type) {
    this.solutionType = type;
    this.getObservationList();
  }

  presentActionSheet(solutionId) {
    let actionSheet = this.actionSheetCtrl.create({
      title: "Select report type",
      buttons: [
        {
          text: "Report with score",
          role: "destructive",
          handler: () => {
            this.goToScoringReportOfSolution(solutionId);
          },
        },
        {
          text: "Report without score",
          handler: () => {
            this.goToReportsOfSolution(solutionId);
          },
        },
        {
          text: "Cancel",
          role: "cancel",
          handler: () => {
            console.log("Cancel clicked");
          },
        },
      ],
    });

    actionSheet.present();
  }

  getObservationList() {
    const payload = {
      entityType: this.entityDetails.entityType,
      entityId: this.entityDetails._id,
      reportType: this.solutionType,
    };
    this.utils.startLoader();
    this.solutionList = [];
    this.apiProvide.httpPost(
      AppConfigs.observationReports.solutionList,
      payload,
      (success) => {
        this.solutionList = success.data;
        this.utils.stopLoader();
      },
      (error) => {
        this.utils.stopLoader();
      },
      { baseUrl: "dhiti", version: "v2" }
    );
  }

  goToReportsOfSolution(solutionId) {
    this.navCtrl.push(ObservationReportsPage, {
      entityType: this.entityDetails.entityType,
      entityId: this.entityDetails._id,
      solutionId: solutionId,
      immediateChildEntityType: this.entityDetails.immediateChildEntityType,
      reportType: this.solutionType,
      from: this.from,
    });
  }

  goToScoringReportOfSolution(solutionId) {
    const payload = {
      entityType: this.entityDetails.entityType,
      entityId: this.entityDetails._id,
      solutionId: solutionId,
      immediateChildEntityType: this.entityDetails.immediateChildEntityType,
      reportType: this.solutionType,
      from: this.from,
    };
    this.navCtrl.push("ReportsWithScorePage", payload);
  }
}
