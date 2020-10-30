import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams, PopoverController } from "ionic-angular";
import { TrashProvider } from "./trash/trash";
import { TrashActionPage } from "./trash-action/trash-action";
import { UtilsProvider } from "../../providers/utils/utils";

/**
 * Generated class for the TrashPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-trash",
  templateUrl: "trash.html",
})
export class TrashPage {
  trashSolList: any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public trashProvider: TrashProvider,
    private popoverCtrl: PopoverController,
    private utils: UtilsProvider
  ) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad TrashPage");
    this.getTrashSolList();
  }

  getTrashSolList() {
    this.utils.startLoader();
    this.trashProvider
      .getTrashSolList()
      .then((data) => {
        console.log(data);
        this.utils.stopLoader();
        this.trashSolList = data;
      })
      .catch(() => {
        this.utils.stopLoader();
      });
  }

  openActionMenu(event, solutionId) {
    let popover = this.popoverCtrl.create(TrashActionPage, { solutionId: solutionId });
    popover.onDidDismiss((data) => {
      if (data == "refresh") this.getTrashSolList();
    });
    popover.present({ ev: event });
  }
}
