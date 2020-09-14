import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams, ModalController } from "ionic-angular";
import { CreatePollPage } from "./pages/create-poll/create-poll";
import { MyCreationsPage } from "./pages/my-creations/my-creations";
import { UtilsProvider } from "../../providers/utils/utils";
import { PollProvider } from "./providers/poll/poll";
import { ResultGraphComponent } from "./component/result-graph/result-graph";

@IonicPage()
@Component({
  selector: "page-feedback-poll",
  templateUrl: "feedback-poll.html",
})
export class FeedbackPollPage {
  allPolls: any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public utils: UtilsProvider,
    public pollProvider: PollProvider,
    public modalCntrl: ModalController
  ) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad FeedbackPollPage");
    this.getPollList();
  }

  goToPage(page: string): void {
    switch (page) {
      case "create":
        this.navCtrl.push(CreatePollPage);
        break;
      case "myCreations":
        this.navCtrl.push(MyCreationsPage);
        break;
      default:
        break;
    }
  }

  getPollList() {
    this.utils.startLoader();
    this.pollProvider
      .getAllPollList()
      .then((res: any) => {
        this.allPolls = res;
        this.utils.stopLoader();
      })
      .catch(() => this.utils.stopLoader());
  }

  openResultModel(pollId): void {
    const resultModal = this.modalCntrl.create(ResultGraphComponent, {
      pollId: pollId,
    });
    resultModal.present();
  }
}
