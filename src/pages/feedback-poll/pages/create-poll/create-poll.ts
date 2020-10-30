import { Component } from "@angular/core";
import { NavController, NavParams, AlertController, ViewController } from "ionic-angular";
import { UtilsProvider } from "../../../../providers/utils/utils";
import { PollPreviewPage } from "../poll-preview/poll-preview";
import { PollProvider } from "../../providers/poll/poll";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "page-create-poll",
  templateUrl: "create-poll.html",
})
export class CreatePollPage {
  pollForm: any;
  options: any = [];
  selectedResponseType: string;
  draft: any;
  metaForm: any;
  emoticons: any = [];
  gestures: any = [];
  translateObject: any;
  responseTypeArr = [
    {
      type: "checkbox",
      label: "multiSelect",
      icon: "",
      ionicon: "checkbox",
    },
    {
      type: "radio",
      label: "singleSelect",
      icon: "",
      ionicon: "radio-button-on",
    },
    {
      type: "emoticons",
      label: "emoticons",
      icon: "😀",
      ionicon: "",
    },
    {
      type: "gestures",
      label: "gestures",
      icon: "👍",
      ionicon: "",
    },
  ];
  allowNavigation: boolean;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private utils: UtilsProvider,
    public alertCtrl: AlertController,
    public pollProvider: PollProvider,
    public viewCntl: ViewController,
    public translateService: TranslateService
  ) {}

  ionViewDidLoad(): void {
    console.log("ionViewDidLoad CreatePollPage");
    this.translateService
      .get([
        "buttons.save",
        "buttons.cancel",
        "buttons.delete",
        "labels.addNew",
        "labels.selectEmoticon",
        "labels.selectGesture",
        "actionSheet.deletePreviosOptions",
        "actionSheet.ok",
      ])
      .subscribe((translations) => {
        this.translateObject = translations;
      });

    this.draft = this.navParams.get("draft");
    if (this.draft) {
      this.options = this.draft.options;
      this.selectedResponseType = this.draft.selectedResponseType;
    }

    this.getPollMeta();
  }

  ionViewWillEnter() {
    this.allowNavigation=false
  }

  addOption(): void {
    if (this.selectedResponseType == "emoticons" || this.selectedResponseType == "gestures") {
      this.addEGOption();
      return;
    }

    const prompt = this.alertCtrl.create({
      title: this.translateObject["labels.addNew"] + " Option",
      inputs: [
        {
          name: "option",
          placeholder: "Option...",
        },
      ],
      buttons: [
        {
          text: this.translateObject["buttons.cancel"],
        },
        {
          text: this.translateObject["buttons.save"],
          handler: (data) => {
            if (data.option) {
              const tempOption = { value: "", label: data.option };
              this.options.includes(tempOption) ? null : this.options.push(tempOption);
              console.log("Saved clicked");
            }
          },
        },
      ],
    });
    prompt.present();
  }
  editOption(option): void {
    const prompt = this.alertCtrl.create({
      title: "Edit Option",
      inputs: [
        {
          name: "label",
          placeholder: "Option...",
          value: option.label,
        },
      ],
      buttons: [
        {
          text: this.translateObject["buttons.cancel"],
        },
        {
          text: this.translateObject["buttons.save"],
          handler: (data) => {
            const i = this.options.indexOf(option);
            this.options[i].label = data.label;
          },
        },
        {
          text: this.translateObject["buttons.delete"],
          handler: () => {
            this.options = this.options.filter((opt) => opt != option);
          },
        },
      ],
    });
    prompt.present();
  }

  addEGOption(): void {
    const tempArr: any = [];
    this[this.selectedResponseType].map((e, index) => {
      const x = {};
      x["type"] = "radio";
      x["label"] = e.unicode + " " + e.name;
      x["value"] = { value: e.unicode, label: e.name };
      tempArr[index] = x;
    });
    const alert = this.alertCtrl.create({
      title:
        this.selectedResponseType == "emoticons"
          ? this.translateObject["labels.selectEmoticon"]
          : this.translateObject["labels.selectGesture"],
      inputs: tempArr,
      buttons: [
        {
          text: this.translateObject["buttons.cancel"],
        },
        {
          text: this.translateObject["actionSheet.ok"],
          handler: (data) => {
            console.log(data);
            if (data) {
              this.options.some((opt) => opt.value == data.value) ? null : this.options.push(data);
            }
          },
        },
      ],
    });
    alert.present();
  }

  share(): void {
    let time = new Date().toUTCString();
    const form = this.pollForm.getRawValue();
    form.options = this.options;
    form.selectedResponseType = this.selectedResponseType;
    form.type = "create";
    form.time = this.draft ? this.draft.time : time;
    if (!this.draft) {
      this.draft = form;
    }
    this.saveToDraft(null, form.time, false);
    console.log(form);
    this.allowNavigation = true;
    this.navCtrl.push(PollPreviewPage, { form: form });
  }

  responseTypeChange(type: string): void {
    if (this.selectedResponseType == type) {
      return;
    } else if (this.selectedResponseType == null || !this.options.length) {
      this.selectedResponseType = type;
      return;
    }
    const confirm = this.alertCtrl.create({
      title: "",
      message: this.translateObject["actionSheet.deletePreviosOptions"],
      buttons: [
        {
          text: this.translateObject["buttons.cancel"],
        },
        {
          text: this.translateObject["actionSheet.ok"],
          handler: () => {
            this.options = [];
            this.selectedResponseType = type;
          },
        },
      ],
    });
    confirm.present();
  }

  saveToDraft(deleteDraft?: any, time = new Date().toUTCString(), pop = true): void {
   
    console.log(this.pollForm);

    const draft = this.pollForm.getRawValue();
    console.log(draft);
    draft["options"] = this.options;
    draft["selectedResponseType"] = this.selectedResponseType;
    draft["time"] = time;
    deleteDraft ? null : this.utils.startLoader();
    this.pollProvider
      .getPollDraft()
      .then((items) => {
        this.draft ? (items = items.filter((i) => i.time !== this.draft.time)) : null;
        deleteDraft ? null : items.push(draft);

        return items;
      })
      .then((items) => {
        console.log(items);
        this.pollProvider.savePollDraft(items);
        deleteDraft ? null : this.utils.openToast("Saved Draft");
      })
      .then(() => {
         this.allowNavigation = true;
        pop ? this.navCtrl.pop() : null;
        deleteDraft ? null : this.utils.stopLoader();
      });
  }

  getPollMeta(): void {
    this.utils.startLoader();
    this.pollProvider
      .getPollMetaField()
      .then((res) => {
        this.metaForm = res["form"];
        this.emoticons = res["emoticons"];
        this.gestures = res["gestures"];

        this.metaForm.forEach((element) => {
          switch (element.field) {
            case "name":
              element.value = this.draft ? this.draft.name : element.value;
              break;
            case "creator":
              element.value = this.draft ? this.draft.creator : element.value;
              break;
            case "endDate":
              element.value = this.draft ? this.draft.endDate : element.value;
              break;
            case "question":
              element.value = this.draft ? this.draft.question : element.value;
          }
        });
        this.pollForm = this.utils.createFormGroup(this.metaForm);
        this.utils.stopLoader();
      })
      .catch(() => this.utils.stopLoader());
  }

  ionViewCanLeave() {
    if (this.pollForm.value.question && !this.allowNavigation) {
      this.saveToDraft(null,undefined,false);
    }
  }
}
