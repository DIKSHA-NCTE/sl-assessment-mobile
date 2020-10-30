import { Component } from "@angular/core";
import { NavController, NavParams, AlertController, ViewController } from "ionic-angular";
import { ProgramServiceProvider } from "../../program-service";
import { UtilsProvider } from "../../../../providers/utils/utils";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "page-solution-action",
  templateUrl: "solution-action.html",
})
export class SolutionActionPage {
  solutionId: any;
  isAPrivateProgram: any;
  translateObject: any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public viewCtrl: ViewController,
    public programSrvc: ProgramServiceProvider,
    public utils: UtilsProvider,
    private translate: TranslateService
  ) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad SolutionActionPage");
    this.solutionId = this.navParams.get("solutionId");
    this.isAPrivateProgram = this.navParams.get("isAPrivateProgram");
    this.translate
      .get([
        "actionSheet.solutionWillNotBeAccessible",
        "actionSheet.solutionWillBeRemovedFromHome",
        "buttons.moveToTrash",
        "buttons.deletePermanently",
        "buttons.cancel",
        "buttons.continue"
      ])
      .subscribe((translations) => {
        this.translateObject = translations;
      });
  }

  removeSolFromHome() {
    this.programSrvc
      .removesolFromHome(this.solutionId)
      .then((res: any) => {
        this.utils.openToast(res.message);
        res.result == this.solutionId ? this.viewCtrl.dismiss("refresh") : this.viewCtrl.dismiss();
      })
      .catch((err) => {
        this.utils.openToast(err.message);
        this.viewCtrl.dismiss();
      });
  }

  delete() {
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

  trash() {
    this.programSrvc
      .trashSol(this.solutionId)
      .then((res: any) => {
        this.utils.openToast(res.message);
        res.result == this.solutionId ? this.viewCtrl.dismiss("refresh") : this.viewCtrl.dismiss();
      })
      .catch((err) => {
        this.utils.openToast(err.message);
        this.viewCtrl.dismiss();
      });
  }

  presentConfirm(deleteFlag = false) {
    let alert;
    if (deleteFlag) {
      alert = this.alertCtrl.create({
        // title: "Confirm purchase",
        message: this.translateObject["actionSheet.solutionWillNotBeAccessible"],

        buttons: [
          {
            text: this.translateObject["buttons.moveToTrash"],
            handler: () => {
              this.trash();
            },
          },
          {
            text: this.translateObject["buttons.deletePermanently"],
            handler: () => {
              this.delete();
            },
          },
        ],
      });
    } else {
      alert = this.alertCtrl.create({
        // title: "Confirm purchase",
        message: this.translateObject["actionSheet.solutionWillBeRemovedFromHome"],
        buttons: [
          {
            text: this.translateObject["buttons.cancel"],
            role: "cancel",
            handler: () => {
              this.viewCtrl.dismiss();
            },
          },
          {
            text: this.translateObject["buttons.continue"],
            handler: () => {
              this.removeSolFromHome();
            },
          },
        ],
      });
    }

    alert.present();
  }
}
