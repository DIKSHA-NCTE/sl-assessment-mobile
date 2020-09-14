import { Component } from "@angular/core";
import { NavController, NavParams, AlertController, ModalController, ViewController } from "ionic-angular";
import { ThanksComponent } from "../../../../components/thanks/thanks";
import { SharingFeaturesProvider } from "../../../../providers/sharing-features/sharing-features";
import { PollProvider } from "../../providers/poll/poll";
import { UtilsProvider } from "../../../../providers/utils/utils";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "page-poll-preview",
  templateUrl: "poll-preview.html",
})
export class PollPreviewPage {
  question: any;
  options: any;
  selectedResponseType: any;
  type: string; // create or submit poll
  response: any;
  time: any;
  form: any;
  qid: any;
  pollId: any;
  generatedLink: string;
  translateObject: any;
  linkExpired: any;
  pollLink: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    public socialShare: SharingFeaturesProvider,
    public pollProvider: PollProvider,
    public viewCtrl: ViewController,
    public utils: UtilsProvider,
    public translateService: TranslateService
  ) {}

  ionViewDidLoad() {
    this.translateService
      .get(["actionSheet.cancel", "actionSheet.ok", "actionSheet.yes", "actionSheet.sharePoll"])
      .subscribe((translations) => {
        this.translateObject = translations;
      });
    console.log("ionViewDidLoad PollPreviewPage");
    this.pollId = this.navParams.get("pollId"); // from deeplink
    this.pollId ? this.getPollQUestionByLink() : null;
    this.form = this.navParams.get("form");
    this.pollLink = this.navParams.get("pollLink");
    if (this.form) {
      this.question = this.form.question;
      this.options = this.form.options;
      this.selectedResponseType = this.form.selectedResponseType || this.form.responseType;
      this.type = this.form.type;
      this.time = this.form.time;
    }
  }

  getPollQUestionByLink(): void {
    this.pollProvider
      .getPollQUestionByLink(this.pollId)
      .then((res) => {
        if (!res["result"]) {
          this.linkExpired = res["message"];
          return;
        }
        res = res["result"];

        const data = res["questions"][0];
        this.pollId = res["pollId"];

        if (res["submissionId"]) {
          this.showThanks();
          return;
        }
        this.options = data.options;
        this.selectedResponseType = data.responseType;
        this.question = data.question;
        this.qid = data.qid;
        this.type = "submit";
      })
      .catch(() => this.utils.stopLoader());
  }

  showConfirm(): void {
    const confirm = this.alertCtrl.create({
      title: "",
      message: this.translateObject["actionSheet.sharePoll"],
      buttons: [
        {
          text: this.translateObject["actionSheet.cancel"],
        },
        {
          text: this.translateObject["actionSheet.yes"],
          handler: () => {
            this.socialSharing();
          },
        },
      ],
    });
    confirm.present();
  }

  submitResponse(): void {
    console.log(this.response);
    let value;
    this.selectedResponseType == "checkbox"
      ? (value = this.response.map((v) => v.value))
      : (value = this.response.value);
    const body = {};
    body[this.qid] = {
      qid: this.qid,
      question: this.question,
      responseType: this.selectedResponseType,
      value: value,
      // label: this.response.label,
    };
    if (this.selectedResponseType == "emoticons" || this.selectedResponseType == "gestures") {
      body[this.qid].unicode = this.options.filter((o) => o.value == this.response.value)[0].unicode;
    }
    this.utils.startLoader();

    this.pollProvider
      .submitPoll(body, this.pollId)
      .then(() => {
        this.utils.stopLoader();
        this.showThanks();
      })
      .catch(() => {
        this.utils.stopLoader();
        this.utils.openToast("Failed to submit ! Please Try Again");
      });
  }

  showThanks(): void {
    this.navCtrl.popToRoot();
    const thanksModal = this.modalCtrl.create(ThanksComponent, { pollId: this.pollId });
    thanksModal.present();
  }

  deleteFromDraft(): void {
    this.pollProvider.getPollDraft().then((items) => {
      items = items.filter((i) => i.time !== this.time);
      this.pollProvider.savePollDraft(items);
    });
  }

  socialSharing(): void {
    this.pollLink ? (this.generatedLink = this.pollLink) : null;
    if (this.generatedLink) {
      this.socialShare.regularShare(this.generatedLink);
      return;
    }
    const body = {
      name: this.form.name,
      creator: this.form.creator,
      questions: [
        {
          question: this.form.question,
          responseType: this.form.selectedResponseType,
          options: this.form.options,
        },
      ],
      endDate: this.form.endDate,
    };

    console.log(body);
    this.utils.startLoader();
    this.pollProvider
      .sharePoll(body)
      .then((res: { link: string }) => {
        this.generatedLink = res.link;
        this.navCtrl.remove(this.viewCtrl.index - 1, 1);
        this.utils.stopLoader();
        this.socialShare.regularShare(res.link);
        this.time ? this.deleteFromDraft() : null;
      })
      .catch(() => {
        this.utils.stopLoader();
      });
  }
}
