import { Component } from "@angular/core";
import { NavController, NavParams, Platform } from "ionic-angular";
import { LibraryProvider } from "../../library-provider/library";
import { LibraryUseTemplatePage } from "../library-use-template/library-use-template";
import { FileTransferObject, FileTransfer } from "@ionic-native/file-transfer";
import { File } from "@ionic-native/file";
import { FileOpener } from "@ionic-native/file-opener";

/**
 * Generated class for the LibrarySolutionDetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: "page-library-solution-details",
  templateUrl: "library-solution-details.html",
})
export class LibrarySolutionDetailsPage {
  solutionId: any;
  template: any;
  type: any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public libraryProvider: LibraryProvider,
    public transfer: FileTransfer,
    public platform: Platform,
    public file: File,
    public fileOpener: FileOpener
  ) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad LibrarySolutionDetailsPage");
    this.solutionId = this.navParams.get("solutionId");
    this.type = this.navParams.get("type");
    this.getSolutionTemplate();
  }
  getSolutionTemplate() {
    this.libraryProvider
      .getSolutiontemplate(this.solutionId, this.type)
      .then((res) => {
        this.template = res;
        console.log("solutionTemplate", this.solutionId, res);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  goToUseTemplate() {
    this.navCtrl.push(LibraryUseTemplatePage, {
      selectedTemplate: this.template,
      solutionId: this.solutionId,
      type: this.type,
    });
  }

  downloadPdf() {
    const fileTransfer: FileTransferObject = this.transfer.create();
    const url = this.template.linkUrl;
    let path = null;
    if (this.platform.is("ios")) {
      path = this.file.documentsDirectory;
    } else if (this.platform.is("android")) {
      path = this.file.dataDirectory;
    }
    fileTransfer.download(url, path + this.template.name).then(
      (entry) => {
        this.fileOpener
          .open(entry.toURL(), "application/pdf")
          .then(() => console.log("File is opened"))
          .catch((e) => console.log("Error opening file", e));
      },
      (error) => {
        console.log(error);
      }
    );
  }
}
