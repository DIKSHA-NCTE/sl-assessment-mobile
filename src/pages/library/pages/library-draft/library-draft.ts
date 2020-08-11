import { Component } from "@angular/core";
import { NavController, NavParams, AlertController } from "ionic-angular";
import { LibraryProvider } from "../../library-provider/library";
import { LibraryUseTemplatePage } from "../library-use-template/library-use-template";
import { UtilsProvider } from "../../../../providers/utils/utils";
import { TranslateService } from "@ngx-translate/core";

/**
 * Generated class for the LibraryDraftPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: "page-library-draft",
  templateUrl: "library-draft.html",
})
export class LibraryDraftPage {
  allDrafts: any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public libraryProvider: LibraryProvider,
    public utils: UtilsProvider,
    public alertCtrl: AlertController,
    public translate: TranslateService
  ) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad LibraryDraftPage");
    this.getDrafts();
  }

  getDrafts() {
    this.libraryProvider
      .getLibraryDraft()
      .then((items) => {
        console.log("drafts", items);
        this.allDrafts = items;
      })
      .catch((err) => {
        console.log(err);
        this.allDrafts = [];
      });
  }

  goToUseTemplate(draft) {
    this.navCtrl.push(LibraryUseTemplatePage, { draft });
  }

  removeDraft(draftTime) {
    this.libraryProvider
      .deleteDraft(draftTime)
      .then((res) => {
        this.getDrafts();
      })
      .catch((err) => {});
  }

  showConfirm(draftTime, name) {
    let translateObject;
    this.translate
      .get(["actionSheet.deleteDraft", "actionSheet.yes", "actionSheet.no"])
      .subscribe((translations) => {
        translateObject = translations;
      });
    const confirm = this.alertCtrl.create({
      title: translateObject["actionSheet.deleteDraft"],
      message: `Do you agree to delete ${name} from drafts?`,
      buttons: [
        {
          text: translateObject["actionSheet.no"],
          handler: () => {
            console.log("Cancel clicked");
          },
        },
        {
          text: translateObject["actionSheet.yes"],
          handler: () => {
            console.log("Delete clicked");
            this.removeDraft(draftTime);
          },
        },
      ],
    });
    confirm.present();
  }
}
