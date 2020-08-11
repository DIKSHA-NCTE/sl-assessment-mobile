import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams, App, Platform } from "ionic-angular";
import { UtilsProvider } from "../../providers/utils/utils";
import { FeedbackProvider } from "../../providers/feedback/feedback";
import { EvidenceProvider } from "../../providers/evidence/evidence";
import { LocalStorageProvider } from "../../providers/local-storage/local-storage";
import { UpdateTrackerProvider } from "../../providers/update-tracker/update-tracker";
import { ManualRatingPage } from "../manual-rating/manual-rating";
import { NetworkGpsProvider } from "../../providers/network-gps/network-gps";
import { ManualRatingProvider } from "../manual-rating/manual-rating-provider/manual-rating";

@IonicPage()
@Component({
  selector: "page-evidence-list",
  templateUrl: "evidence-list.html",
})
export class EvidenceListPage {
  entityId: any;
  entityName: string;
  entityEvidences: any;
  entityData: any;
  currentEvidenceStatus: string;
  isIos: boolean = this.platform.is("ios");
  generalQuestions: any;
  submissionId: any;
  recentlyUpdatedEntity: any;
  canShowManualRating: boolean;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private updateTracker: UpdateTrackerProvider,
    private appCtrl: App,
    private utils: UtilsProvider,
    private localStorage: LocalStorageProvider,
    private feedback: FeedbackProvider,
    private evdnsServ: EvidenceProvider,
    private platform: Platform,
    private ngps: NetworkGpsProvider,
    private manualRatingProvider: ManualRatingProvider
  ) {
    this.entityId = this.navParams.get("_id");
    this.entityName = this.navParams.get("name");
    this.recentlyUpdatedEntity = this.navParams.get("recentlyUpdatedEntity");
    // this.submissionId = this.navParams.get('submissionId');
  }

  ionViewWillEnter() {
    console.log(JSON.stringify(this.recentlyUpdatedEntity));

    console.log("ionViewDidLoad EvidenceListPage");
    this.utils.startLoader();
    this.localStorage
      .getLocalStorage(this.utils.getAssessmentLocalStorageKey(this.entityId))
      .then((successData) => {
        this.utils.stopLoader();
        this.entityData = successData;

        this.checkAllEvidenceSubmitted();
        console.log("123124124134");
        console.log(JSON.stringify(successData));
        this.entityEvidences = this.updateTracker.getLastModifiedInEvidences(
          this.entityData["assessment"]["evidences"],
          this.recentlyUpdatedEntity
        );
        this.mapCompletedAndTotalQuestions();
        this.checkForProgressStatus();
        this.localStorage
          .getLocalStorage("generalQuestions_" + this.entityId)
          .then((successData) => {
            this.generalQuestions = successData;
          })
          .catch((error) => {});
      })
      .catch((error) => {
        this.utils.stopLoader();
      });
  }

  mapCompletedAndTotalQuestions() {
    for (const evidence of this.entityEvidences) {
      let totalQuestions = 0;
      let completedQuestions = 0;
      for (const section of evidence.sections) {
        totalQuestions = totalQuestions + section.totalQuestions;
        completedQuestions = completedQuestions + section.completedQuestions;
      }
      let percentage = totalQuestions ? (completedQuestions / totalQuestions) * 100 : 0;
      if (!completedQuestions) {
        percentage = 0;
      }
      evidence.completePercentage = Math.trunc(percentage);
    }
  }

  goToGeneralQuestionList(): void {
    this.appCtrl.getRootNav().push("GeneralQuestionListPage", {
      _id: this.entityId,
      name: this.entityName,
    });
  }

  checkForProgressStatus() {
    for (const evidence of this.entityEvidences) {
      if (evidence.isSubmitted) {
        evidence.progressStatus = "submitted";
      } else if (!evidence.startTime) {
        evidence.progressStatus = "";
      } else {
        evidence.progressStatus = "completed";
        for (const section of evidence.sections) {
          if (section.progressStatus === "inProgress" || !section.progressStatus) {
            evidence.progressStatus = "inProgress";
          }
        }
      }
    }
  }

  openAction(assessment, evidenceIndex) {
    this.utils.setCurrentimageFolderName(this.entityEvidences[evidenceIndex].externalId, assessment._id);
    const options = {
      _id: assessment._id,
      name: assessment.name,
      selectedEvidence: evidenceIndex,
      entityDetails: this.entityData,
    };
    this.evdnsServ.openActionSheet(options);
  }

  navigateToEvidence(index): void {
    if (this.entityEvidences[index].startTime) {
      this.utils.setCurrentimageFolderName(this.entityEvidences[index].externalId, this.entityId);
      this.navCtrl.push("SectionListPage", {
        _id: this.entityId,
        name: this.entityName,
        selectedEvidence: index,
      });
    } else {
      const entity = { _id: this.entityId, name: this.entityName };
      this.openAction(entity, index);
    }
  }

  ionViewWillLeave() {}

  feedBack() {
    this.feedback.sendFeedback();
  }
  goToManualRating(): void {
    const navParams = {
      entityName: this.entityName,
      submissionId: this.entityData["assessment"].submissionId,
    };
    this.navCtrl.push(ManualRatingPage, { navParams });
  }

  checkAllEvidenceSubmitted(): null {
    if (!this.ngps.getNetworkStatus() || this.entityData.solution.scoringSystem != "manual") {
      console.log("No network");
      this.canShowManualRating = false;
      return;
    }
    const submissionId = this.entityData["assessment"].submissionId;
    this.manualRatingProvider
      .checkAllECMStatus(submissionId)
      .then((res) => {
        console.log(res);
        res.status == "ratingPending" ? (this.canShowManualRating = true) : (this.canShowManualRating = false);
      })
      .catch(() => (this.canShowManualRating = false));
  }
}
