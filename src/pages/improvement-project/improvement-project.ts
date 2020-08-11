import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { ImprovementProjectEntityPage } from "./improvement-project-entity/improvement-project-entity";
import { ApiProvider } from "../../providers/api/api";
import { UtilsProvider } from "../../providers/utils/utils";
import { AppConfigs } from "../../providers/appConfig";

/**
 * Generated class for the ImprovementProjectPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-improvement-project",
  templateUrl: "improvement-project.html",
})
export class ImprovementProjectPage {
  programList: any[];
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private apiService: ApiProvider,
    private utils: UtilsProvider
  ) {}

  ionViewDidLoad() {
    this.getAssessmentPrograms();
    console.log("ionViewDidLoad ImprovementProjectPage");
  }

  goToIpEntity(programId, programName) {
    this.navCtrl.push(ImprovementProjectEntityPage, {
      heading: programName,
      programId: programId,
    });
  }

  getAssessmentPrograms() {
    let url = AppConfigs.improvementProject.listAssessmentPrograms;
    let payload = {};
    this.utils.startLoader();
    this.apiService.httpPost(
      url,
      payload,
      (success) => {
        this.utils.stopLoader();
        console.log(JSON.stringify(success));

        if (success.result === true && success.data) {
          this.programList = success.data;
        } else {
          this.programList = [];
          // this.utils.openToast(success.data);
        }
      },
      (error) => {
        this.programList = [];
        this.utils.openToast(error.message);

        this.utils.stopLoader();
      },
      { baseUrl: "dhiti", version: "v1" }
    );
  }
}
