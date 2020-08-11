import { Component } from "@angular/core";
import { InAppBrowser, InAppBrowserOptions } from "@ionic-native/in-app-browser";
import { PhotoViewer } from "@ionic-native/photo-viewer";
import { StreamingMedia, StreamingVideoOptions } from "@ionic-native/streaming-media";
import { ApiProvider } from "../../providers/api/api";
import { AppConfigs } from "../../providers/appConfig";
import { UtilsProvider } from "../../providers/utils/utils";
import { NavParams } from "ionic-angular";
/**
 * Generated class for the EvidenceAllListComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: "evidence-all-list",
  templateUrl: "evidence-all-list.html",
})
export class EvidenceAllListComponent {
  selectedTab;

  payload: any;
  remarks: any;
  images: any;
  videos: any;
  documents: any;
  audios: any;
  data: any;

  constructor(private apiService: ApiProvider, private utils: UtilsProvider, private navParams: NavParams) {}

  ionViewDidLoad() {
    this.selectedTab = "evidence";
    const submissionId = this.navParams.get("submissionId");
    const observationId = this.navParams.get("observationId");
    const entityId = this.navParams.get("entityId");
    const questionExternalId = this.navParams.get("questionExternalId");
    const entityType = this.navParams.get("entityType");
    this.data = this.navParams.get("data");
    this.payload = {
      submissionId: submissionId,
      questionId: questionExternalId,
      observationId: observationId,
      entityId: entityId,
      entityType: entityType,
    };
    this.data ? this.setAllEvidence() : this.getAllEvidence();
  }

  onTabChange(tabName) {
    this.selectedTab = tabName;
  }

  setAllEvidence() {
    console.log(this.data);
    this.images = this.data.images;
    this.videos = this.data.videos;
    this.documents = this.data.documents;
    this.remarks = this.data.remarks;
    this.audios = this.data.audios;
  }

  getAllEvidence() {
    let url = AppConfigs.observationReports.allEvidence;
    this.utils.startLoader();

    this.apiService.httpPost(
      url,
      this.payload,
      (success) => {
        this.utils.stopLoader();
        console.log(JSON.stringify(success));

        if (success.result === true && success.data) {
          this.images = success.data.images;
          this.videos = success.data.videos;
          this.documents = success.data.documents;
          this.remarks = success.data.remarks;
          this.audios = success.data.audios;
        } else {
          this.utils.openToast(success.data);
        }
      },
      (error) => {
        this.utils.openToast(error.message);

        this.utils.stopLoader();
      },
      { baseUrl: "dhiti", version: "v1" }
    );
  }
}
