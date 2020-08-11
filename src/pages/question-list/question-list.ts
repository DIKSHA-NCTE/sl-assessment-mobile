import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ViewController,
} from "ionic-angular";
import { UtilsProvider } from "../../providers/utils/utils";

/**
 * Generated class for the QuestionListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: "page-question-list",
  templateUrl: "question-list.html",
})
export class QuestionListPage {
  allQuestions;
  filteredQuestions;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private viewCntrl: ViewController,
    private utils: UtilsProvider
  ) {}

  ionViewDidLoad() {
    this.allQuestions = this.navParams.get("allQuestions");
    this.filteredQuestions = this.navParams.get("filteredQuestions");
    console.log("ionViewDidLoad QuestionListPage");
  }

  onQuestionClick(externalId) {
    if (this.filteredQuestions.includes(externalId)) {
      const indexOfQuestion = this.filteredQuestions.indexOf(externalId);
      this.filteredQuestions.splice(indexOfQuestion, 1);
    } else {
      this.filteredQuestions.push(externalId);
    }
    console.log(JSON.stringify(this.filteredQuestions));
  }

  applyFilter() {
    !this.filteredQuestions.length
      ? this.utils.openToast("Select at least one question")
      : this.viewCntrl.dismiss({
          filter: this.filteredQuestions,
          action: "updated",
        });
  }

  close() {
    this.viewCntrl.dismiss({ action: "cancelled" });
  }
}
