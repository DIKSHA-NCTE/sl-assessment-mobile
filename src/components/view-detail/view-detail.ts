import { Component } from "@angular/core";
import { NavParams } from "ionic-angular";

/**
 * Generated class for the ViewDetailComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: "view-detail",
  templateUrl: "view-detail.html",
})
export class ViewDetailComponent {
  submission: any;

  constructor(params: NavParams) {
    console.log("Hello ViewDetailComponent Component");

    this.submission = params.get("submission");
    console.log(this.submission);
  }
}
