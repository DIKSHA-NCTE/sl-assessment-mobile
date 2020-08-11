import { Component, OnInit } from "@angular/core";
import {
  NavParams,
  AlertController,
  ViewController,
  ModalController,
} from "ionic-angular";
import { TranslateService } from "@ngx-translate/core";
import { DatePipe } from "@angular/common";
import { ViewDetailComponent } from "../view-detail/view-detail";

@Component({
  selector: "submission-actions",
  templateUrl: "submission-actions.html",
})
export class SubmissionActionsComponent implements OnInit {
  text: string;
  submission: any;
  translateObject: any;

  constructor(
    private navParams: NavParams,
    private alertCntrler: AlertController,
    private viewCntrlr: ViewController,
    private translateService: TranslateService,
    private modalCtrl: ModalController,
    private datepipe: DatePipe
  ) {
    console.log("Hello SubmissionActionsComponent Component");
    this.text = "Hello World";
  }

  ngOnInit() {
    this.submission = this.navParams.get("submission");
    this.translateService
      .get(["buttons.update", "buttons.cancel", "labels.instanceName"])
      .subscribe((translations) => {
        this.translateObject = translations;
      });
  }

  presentAlert() {
    let alert = this.alertCntrler.create({
      title: this.translateObject["labels.instanceName"],
      inputs: [
        {
          name: "title",
          placeholder: "Title",
          value: this.submission.title,
        },
      ],
      buttons: [
        {
          text: this.translateObject["buttons.cancel"],
          role: "cancel",
          handler: (data) => {
            console.log("Cancel clicked");
            this.viewCntrlr.dismiss();
          },
        },
        {
          text: this.translateObject["buttons.update"],
          handler: (data) => {
            const payload = {
              action: "update",
              name: data.title,
            };
            this.viewCntrlr.dismiss(payload);
          },
        },
      ],
    });
    alert.present();
  }

  presentModal() {
    this.viewCntrlr.dismiss();
    // let alert = this.alertCntrler.create({
    //   title: this.submission.title,
    //   subTitle:
    //     "Created On " +
    //     this.datepipe.transform(this.submission.createdAt, "M/d/yy, h:mm a"),
    //   buttons: ["Dismiss"],
    // });
    // alert.present();

    const modal = this.modalCtrl.create(ViewDetailComponent, {
      submission: this.submission,
    });
    modal.present();
  }
}
