import { Component, Input } from "@angular/core";
import {
  StreamingVideoOptions,
  StreamingMedia,
} from "@ionic-native/streaming-media";
import { InAppBrowser } from "@ionic-native/in-app-browser";
import { PhotoViewer } from "@ionic-native/photo-viewer";

/**
 * Generated class for the AttachmentsComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: "attachments",
  templateUrl: "attachments.html",
})
export class AttachmentsComponent {
  @Input() url: string;
  @Input() extension: string;

  constructor(
    private iab: InAppBrowser,
    private photoViewer: PhotoViewer,
    private streamingMedia: StreamingMedia
  ) {
    console.log("Hello AttachmentsComponent Component");
  }

  playVideo(link) {
    let options: StreamingVideoOptions = {
      successCallback: () => {
        console.log("Video played");
      },
      errorCallback: (e) => {
        console.log("Error streaming");
      },
      orientation: "landscape",
      shouldAutoClose: true,
      controls: false,
    };

    this.streamingMedia.playVideo(link, options);
  }

  openImage(link) {
    this.photoViewer.show(link);
  }

  openDocument(link) {
    debugger;
    this.iab.create(
      "https://docs.google.com/viewer?url=" + encodeURIComponent(link),
      "_self",
      "location=no,toolbar=no"
    );
  }
}
