import { Component } from "@angular/core";
import { NavController, NavParams, App } from "ionic-angular";
import { ApiProvider } from "../../../providers/api/api";
import { AppConfigs } from "../../../providers/appConfig";
import { UtilsProvider } from "../../../providers/utils/utils";
import { ProgramListingPage } from "../program-listing/program-listing";

/**
 * Generated class for the ReportEntityListingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: "page-report-entity-listing",
  templateUrl: "report-entity-listing.html",
})
export class ReportEntityListingPage {
  entities: any;
  instanceReportData: any;
  entityType;
  currentEntityType: any;
  assessmentType;
  from: any;
  constructor(
    public navCtrl: NavController,
    private utils: UtilsProvider,
    private apiProvider: ApiProvider,
    public navParams: NavParams,
    public app: App
  ) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad ReportEntityListingPage");
    this.entities = this.navParams.get("data");
    this.entityType = this.navParams.get("entityType");
    this.currentEntityType = this.navParams.get("currentEntityType");
    // this.assessmentType = this.navParams.get("assessmentType");
    this.currentEntityType = this.currentEntityType
      ? this.currentEntityType
      : this.entityType;
    this.from = this.navParams.get("from");
    console.log(JSON.stringify(this.navParams));
  }
  selectEntity(entity) {
    console.log("select entity");

    if (entity.immediateSubEntityType) {
      this.utils.startLoader();
      let url = entity._id
        ? AppConfigs.roles.entityList +
          entity._id +
          "?type=" +
          entity.immediateSubEntityType
        : AppConfigs.roles.entityList +
          entity.entityId +
          "?type=" +
          entity.entityType;
      this.apiProvider.httpGet(
        url,
        (success) => {
          console.log(success.result[0].entityType);
          if (this.from == "bottomTab") {
            this.app.getRootNav().push(ReportEntityListingPage, {
              data: success.result,
              entityType: entity.immediateSubEntityType,
              assessmentType: this.assessmentType,
            });
          } else {
            this.navCtrl.push(ReportEntityListingPage, {
              data: success.result,
              entityType: entity.immediateSubEntityType,
              assessmentType: this.assessmentType,
            });
          }

          this.utils.stopLoader();
        },
        (error) => {
          this.utils.stopLoader();

          this.utils.openToast(error);
        }
      );
    }
  }

  viewInstanceReportNew(entity) {
    this.navCtrl.push(ProgramListingPage, {
      entity: entity,
    });
  }

  //TODO:this function is not used now
  viewInstanceReport(entity) {
    console.log(JSON.stringify(entity));
    // console.log("api called")
    // this.utils.startLoader();
    // this.apiProvider.httpPost(AppConfigs.roles.instanceReport,{"entityId" : entity._id},success =>{
    //   this.instanceReportData = success;
    if (this.assessmentType !== "observation") {
      this.navCtrl.push(ProgramListingPage, {
        entity: entity,
        // assessmentType: this.assessmentType,
      });
    } else {
      this.navCtrl.push("ObservationListingPage", {
        entity: entity,
        // assessmentType: this.assessmentType,
        // from: this.from,
      });
    }
    //   console.log(JSON.stringify(success))
    //   this.utils.stopLoader();
    // },error=>{
    //   this.utils.stopLoader();
    //   console.log("error");
    //   this.utils.openToast(error)

    // },{"dhiti":true})
  }
}
