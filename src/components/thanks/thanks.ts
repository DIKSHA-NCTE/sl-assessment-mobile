import { Component } from "@angular/core";
import { NavParams, ModalController } from "ionic-angular";
import { ResultGraphComponent } from "../../pages/feedback-poll/component/result-graph/result-graph";

/**
 * Generated class for the ThanksComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: "thanks",
  templateUrl: "thanks.html",
})
export class ThanksComponent {
  text: string;
  pollId: any;

  constructor(public params: NavParams, public modalCntrl: ModalController) {
    console.log("Hello ThanksComponent Component");

    this.pollId = this.params.get("pollId");
  }

  goToResult() {
    const resultModal = this.modalCntrl.create(ResultGraphComponent, {
      pollId: this.pollId,
    });
    resultModal.onDidDismiss((result) => {});
    resultModal.present();
  }
}
