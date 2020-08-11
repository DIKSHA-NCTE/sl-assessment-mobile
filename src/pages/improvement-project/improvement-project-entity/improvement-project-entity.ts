import { Component } from "@angular/core";
import { NavController, NavParams } from "ionic-angular";
import { ImprovementProjectEntitySolutionPage } from "../improvement-project-entity-solution/improvement-project-entity-solution";
import { ApiProvider } from "../../../providers/api/api";
import { UtilsProvider } from "../../../providers/utils/utils";
import { AppConfigs } from "../../../providers/appConfig";

/**
 * Generated class for the ImprovementProjectEnityPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: "page-improvement-project-entity",
  templateUrl: "improvement-project-entity.html",
})
export class ImprovementProjectEntityPage {
  programName: any;
  programId: any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private apiService: ApiProvider,
    private utils: UtilsProvider
  ) {
    this.programName = this.navParams.get("heading");
    this.programId = this.navParams.get("programId");
  }
  programEntity: any;
  ionViewDidLoad() {
    console.log("ionViewDidLoad ImprovementProjectEnityPage");
    this.getAssessmentEntity();
  }

  goToIpEntitySol(entityId, entityName, solutions, entityType) {
    let dataObj = {
      heading: entityName,
      solutions: solutions,
      entityId: entityId,
      entityType: entityType,
      programId: this.programId,
    };
    this.navCtrl.push(ImprovementProjectEntitySolutionPage, { dataObj });
  }

  getAssessmentEntity() {
    let url = AppConfigs.improvementProject.listAssessmentEntity;
    let payload = { programId: this.programId };
    this.utils.startLoader();
    this.apiService.httpPost(
      url,
      payload,
      (success) => {
        this.utils.stopLoader();
        console.log(JSON.stringify(success));

        if (success.result === true && success.data) {
          this.programEntity = success.data;
        } else {
          this.programEntity = [];
          // this.utils.openToast(success.data);
        }
      },
      (error) => {
        this.programEntity = [];
        this.utils.openToast(error.message);

        this.utils.stopLoader();
      },
      { baseUrl: "dhiti", version: "v1" }
    );
  }
}
