import { Component } from "@angular/core";
import { NavController, NavParams } from "ionic-angular";
import { SuggestedImprovementsPage } from "../suggested-improvements/suggested-improvements";

/**
 * Generated class for the ImprovementProjectEntitySolutionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: "page-improvement-project-entity-solution",
  templateUrl: "improvement-project-entity-solution.html",
})
export class ImprovementProjectEntitySolutionPage {
  programEntitySol: any;
  entityName: any;
  entityId: any;
  programId: any;
  entityType: any;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    let dataObj = this.navParams.get("dataObj");
    this.entityName = dataObj.heading;
    this.entityId = dataObj.entityId;
    this.entityType = dataObj.entityType;
    this.programId = dataObj.programId;
    this.programEntitySol = dataObj.solutions;
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad ImprovementProjectEntitySolutionPage");
  }

  goToImpSugg(solId, solName) {
    let dataObj = {
      heading: solName,
      solutionId: solId,
      entityId: this.entityId,
      entityType: this.entityType,
      programId: this.programId,
    };
    this.navCtrl.push(SuggestedImprovementsPage, { dataObj });
  }
}
