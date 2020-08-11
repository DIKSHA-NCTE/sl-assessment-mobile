import { Component, Input } from "@angular/core";
import { ProgramSolutionEntityPage } from "../../program-solution-entity/program-solution-entity";
import { NavController, App } from "ionic-angular";
import { ProgramSolutionObservationDetailPage } from "../../program-solution-observation-detail/program-solution-observation-detail";

/**
 * Generated class for the ProgramSolutionComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: "program-solution",
  templateUrl: "program-solution.html",
})
export class ProgramSolutionComponent {
  @Input("solutionMeta") solution: any;
  @Input("programIndex") programIndex: any;
  @Input("solutionIndex") solutionIndex: any;
  @Input("showProgram") showProgram: boolean;
  @Input("programList") programList: any;
  program: any;
  constructor(public navCtrl: NavController, public app: App) {
    console.log("Hello ProgramSolutionComponent Component");
  }

  //Redirect on solution click based on sol type,observation individual or institutional

  redirectOnSoluctionClick() {
    this.solution.type == "observation" ? this.goToProgSolObservationDetails() : this.goToProgramSolEntity();
  }

  goToProgramSolEntity() {
    this.navCtrl.push(ProgramSolutionEntityPage, {
      programIndex: this.programIndex,
      solutionIndex: this.solutionIndex,
    });
    // this.app.getRootNav().push(ProgramSolutionEntityPage, {
    //   programIndex: this.programIndex,
    //   solutionIndex: this.solutionIndex,
    // });
  }

  goToProgSolObservationDetails() {
    this.navCtrl.push(ProgramSolutionObservationDetailPage, {
      programIndex: this.programIndex,
      solutionIndex: this.solutionIndex,
    });
    /* this.app.getRootNav().push(ProgramSolutionObservationDetailPage, {
      programIndex: this.programIndex,
      solutionIndex: this.solutionIndex,
    }); */
  }
}
