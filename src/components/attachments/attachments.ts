import { Component, Input } from "@angular/core";
import {
  StreamingVideoOptions,
  StreamingMedia,
} from "@ionic-native/streaming-media";
import { InAppBrowser } from "@ionic-native/in-app-browser";
import { PhotoViewer } from "@ionic-native/photo-viewer";
import { FileExtension } from "../../constants/fileExtesion";

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
  imageFormats: string[] = FileExtension.imageFormats;
  videoFormats: string[] = FileExtension.videoFormats;
  audioFormats: string[] = FileExtension.audioFormats;
  pdfFormats: string[] = FileExtension.pdfFormats;

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

  playAudio(link) {
    let options: StreamingVideoOptions = {
      successCallback: () => {
        console.log("Video played");
      },
      errorCallback: (e) => {
        console.log("Error streaming");
      },
      shouldAutoClose: true,
      controls: true,
    };

    this.streamingMedia.playAudio(link, options);
  }

  openImage(link) {
    this.photoViewer.show(link);
  }

  openDocument(link) {
    const browser = this.iab.create(
      "https://docs.google.com/viewer?url=" + encodeURIComponent(link),
      "",
      "location=no,toolbar=no"
    );
  }
}
