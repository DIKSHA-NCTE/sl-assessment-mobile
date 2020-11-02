import { Component } from "@angular/core";
import { NavController, NavParams, AlertController, ViewController } from "ionic-angular";
import { ProgramServiceProvider } from "../../programs/program-service";
import { UtilsProvider } from "../../../providers/utils/utils";
import { TrashProvider } from "../trash/trash";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "page-trash-action",
  templateUrl: "trash-action.html",
})
export class TrashActionPage {
  solutionId: any;
  translateObject: any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public viewCtrl: ViewController,
    public programSrvc: ProgramServiceProvider,
    public utils: UtilsProvider,
    public trashProvider: TrashProvider,
    private translate: TranslateService
  ) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad TrashActionPage");
    this.solutionId = this.navParams.get("solutionId");

    this.translate
      .get([
        "actionSheet.solutionWillNotBeAccessible",
        "buttons.cancel",
        "buttons.continue",
        "buttons.deletePermanently",
      ])
      .subscribe((translations) => {
        this.translateObject = translations;
      });
  }
  presentConfirm() {
    let alert;

    alert = this.alertCtrl.create({
      message: this.translateObject["actionSheet.solutionWillNotBeAccessible"],

      buttons: [
        {
          text: this.translateObject["buttons.cancel"],
          handler: () => {
            this.viewCtrl.dismiss();
          },
        },
        {
          text: this.translateObject["buttons.deletePermanently"],
          handler: () => {
            this.deleteSolFromTrash();
          },
        },
      ],
    });

    alert.present();
  }

  deleteSolFromTrash() {
    this.programSrvc
      .deleteSolPermanently(this.solutionId)
      .then((res: any) => {
        this.utils.openToast(res.message);
        res.result == this.solutionId ? this.viewCtrl.dismiss("refresh") : this.viewCtrl.dismiss();
      })
      .catch((err) => {
        this.utils.openToast(err.message);
      });
  }

  restoreSolFromTrash() {
    this.trashProvider
      .restoreSolFromTrash(this.solutionId)
      .then((res: any) => {
        this.utils.openToast(res.message);
        res.result == this.solutionId ? this.viewCtrl.dismiss("refresh") : this.viewCtrl.dismiss();
      })
      .catch((err) => {
        this.utils.openToast(err.message);
      });
  }
}
