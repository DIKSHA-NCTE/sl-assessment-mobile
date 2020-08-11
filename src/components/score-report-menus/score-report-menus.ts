import { Component, Input } from "@angular/core";
import {
  NavController,
  NavParams,
  AlertController,
  Events,
  Platform,
  ViewController,
  App,
} from "ionic-angular";

import { ReportsWithScorePage } from "../../pages/reports-with-score/reports-with-score";
import { ObservationReportsPage } from "../../pages/observation-reports/observation-reports";

/**
 * Generated class for the ScoreReportMenusComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: "score-report-menus",
  templateUrl: "score-report-menus.html",
})
export class ScoreReportMenusComponent {
  // @Input() submission;
  // @Input() showEntityActionsheet;
  // @Input() showActionsheet;
  // @Input() submissionList;
  // @Input() showSubmissionAction
  // @Input() observationReport
  submission;
  entity;
  navigateToobservationReport: boolean = false;
  showEntityActionsheet;
  showActionsheet;
  submissionList;
  showSubmissionAction;
  observationDetail;
  observationId;
  observationReport;
  entityType: any;
  constructor(
    public navParams: NavParams,
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public appCtrl: App
  ) {
    this.submission = this.navParams.get("submission");
    this.entity = this.navParams.get("entityId");
    this.observationId = this.navParams.get("observationId");
    this.observationReport = this.navParams.get("observationReport");
    this.navigateToobservationReport = this.navParams.get(
      "navigateToobservationReport"
    );
    this.observationDetail = this.navParams.get("observationDetail");

    this.entityType = this.navParams.get("entityType");
  }

  ngOnInit() {}

  viewObservationReportsWithoutScore() {
    const payload = {
      observationId: this.observationDetail.observationId,
      entityType: this.entityType,
    };
    this.viewCtrl.dismiss();
    this.appCtrl.getRootNav().push(ObservationReportsPage, payload);
  }
  viewObservationReportWithScore() {
    const payload = {
      observationId: this.observationDetail.observationId,
      entityType: this.entityType,
    };
    this.viewCtrl.dismiss();
    this.appCtrl.getRootNav().push("ReportsWithScorePage", payload);
  }
  actionsWithScore() {
    this.viewCtrl.dismiss();
    this.showActionsheet = false;
    this.appCtrl.getRootNav().push("ReportsWithScorePage", {
      //in place of _id getting submissionId in new
      //TODO:remove _id
      submissionId: this.submission._id || this.submission.submissionId,
      entityType: this.entityType,
    });
  }
  actions() {
    this.viewCtrl.dismiss();
    this.showActionsheet = false;
    this.appCtrl.getRootNav().push(ObservationReportsPage, {
      //in place of _id getting submissionId in new
      //TODO:remove _id
      submissionId: this.submission._id || this.submission.submissionId,
      entityType: this.entityType,
    });
  }
  viewEntityReportsWithScore() {
    this.viewCtrl.dismiss();
    const payload = {
      entityId: this.entity,
      observationId: this.observationId,
      entityType: this.entityType,
    };
    this.appCtrl.getRootNav().push("ReportsWithScorePage", payload);
  }
  viewEntityReports() {
    this.viewCtrl.dismiss();
    this.showEntityActionsheet = false;
    this.showActionsheet = false;
    const payload = {
      entityId: this.entity,
      observationId: this.observationId,
      entityType: this.entityType,
    };
    this.appCtrl.getRootNav().push(ObservationReportsPage, payload);
  }
  // navigate to score report
  public navigateToScoreReport() {
    if (this.entity) {
      this.viewEntityReportsWithScore();
    } else if (this.submission) {
      this.actionsWithScore();
    } else if (this.navigateToobservationReport && this.observationDetail) {
      this.viewObservationReportWithScore();
    }
  }
  // navigate to withou score report
  public navigateToWithoutScoreReport() {
    if (this.entity) {
      this.viewEntityReports();
    } else if (this.submission) {
      this.actions();
    } else if (this.observationDetail) {
      this.viewObservationReportsWithoutScore();
    }
  }
}
