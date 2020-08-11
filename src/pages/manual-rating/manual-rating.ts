import { Component, Pipe, PipeTransform } from "@angular/core";
import { IonicPage, NavController, NavParams, ModalController, AlertController } from "ionic-angular";
import { CriteriaListPage } from "../criteria-list/criteria-list";
import { EvidenceAllListComponent } from "../../components/evidence-all-list/evidence-all-list";

import { ManualRatingProvider } from "./manual-rating-provider/manual-rating";
import { UtilsProvider } from "../../providers/utils/utils";
import { ProgramServiceProvider } from "../programs/program-service";
import { TranslateService } from "@ngx-translate/core";

/**
 * Generated class for the ManualRatingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Pipe({ name: "criteriaPipe" })
export class criteriaFilterPipe implements PipeTransform {
  transform(list: any[], filterList?: string[]): any[] {
    const r = list.filter((elem) => filterList.find((id) => elem["id"] === id));
    return filterList.length ? r : list;
  }
}
@Component({
  selector: "page-manual-rating",
  templateUrl: "manual-rating.html",
  providers: [criteriaFilterPipe],
})
export class ManualRatingPage {
  entityName: string;
  selectedRange: number;
  data;

  filteredCriterias: string[] = [];
  submissionId: any;
  canLeave = true;
  get range(): number {
    if (!this.data) {
      return null;
    }

    return this.data.levelToScoreMapping.length - 1;
  }

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private modal: ModalController,
    private manualRatingProvider: ManualRatingProvider,
    private utils: UtilsProvider,
    private alertCtrl: AlertController,
    private programService: ProgramServiceProvider,
    private translate: TranslateService
  ) {}

  ionViewDidLoad(): void {
    console.log("ionViewDidLoad ManualRatingPage");
    const navParams = this.navParams.get("navParams");
    this.submissionId = navParams.submissionId;
    this.entityName = navParams.entityName;
    this.getRatingData();
  }

  getRatingData(): void {
    this.utils.startLoader();
    this.manualRatingProvider
      .getRatingData(this.submissionId)
      .then((data) => {
        this.data = data;
        this.utils.stopLoader();
        this.markAllCriteriaSelected();
        this.data.levelToScoreMapping.unshift({ level: null, points: null, label: null });
        this.applyIfRatingPresent();
      })
      .catch(() => {
        this.utils.stopLoader();
      });
  }

  applyIfRatingPresent(): void {
    this.data.criteriaQuestions.map((criteriaQuestion) => {
      if (criteriaQuestion.score) {
        let index = null;
        const criteria = this.data.levelToScoreMapping.find((c, i) => {
          index = i;
          return c.level == criteriaQuestion.score;
        });
        criteriaQuestion["tempLabel"] = criteria.label;
        criteriaQuestion["selectedRange"] = index;
      }
    });
  }

  slideChange(criteriaIndex: number, selectedRange: number, e: any): void {
    this.canLeave = false;
    if (selectedRange == 0) {
      this.data.criteriaQuestions[criteriaIndex].score = "";
      e["_elementRef"].nativeElement.querySelector(".range-pin").textContent = "None";
      return;
    }
    this.data.criteriaQuestions[criteriaIndex].score = this.data.levelToScoreMapping[selectedRange].level || null;
    this.data.criteriaQuestions[criteriaIndex]["tempLabel"] = this.data.levelToScoreMapping[selectedRange].label;
    e["_elementRef"].nativeElement.querySelector(".range-pin").textContent = this.data.levelToScoreMapping[
      selectedRange
    ].label;
  }

  markAllCriteriaSelected(): void {
    for (const criteria of this.data.criteria) {
      this.filteredCriterias.push(criteria["id"]);
    }
  }

  openCriteriaFilter(): void {
    const modal = this.modal.create(CriteriaListPage, {
      allCriterias: this.data.criteria,
      filteredCriterias: JSON.parse(JSON.stringify(this.filteredCriterias)),
    });
    modal.present();
    modal.onDidDismiss((response) => {
      if (
        response &&
        response.action === "updated" &&
        JSON.stringify(response.filter) !== JSON.stringify(this.filteredCriterias)
      ) {
        this.filteredCriterias = response.filter;
      }
    });
  }

  allEvidence(criteriaIndex: number, questionIndex: number): void {
    const data = this.data.criteriaQuestions[criteriaIndex].questions[questionIndex]["evidences"] || {};
    const remarks = this.data.criteriaQuestions[criteriaIndex].questions[questionIndex]["remarks"];
    data["remarks"] = remarks;
    const preState = this.canLeave;
    this.canLeave = true;
    this.navCtrl.push(EvidenceAllListComponent, { data }).then(() => (this.canLeave = preState));
  }

  submitRating(): void {
    const responseObj = {};
    for (const criteria of this.data.criteriaQuestions) {
      if (!criteria.score) {
        this.utils.openToast("Rate all criteria before submitting");
        return;
      }
      responseObj[criteria.id] = criteria.score;
    }
    this.utils.startLoader();
    this.manualRatingProvider
      .submitManualRating(responseObj, this.submissionId)
      .then(async (res) => {
        await this.programService.refreshObservationList();
        this.utils.stopLoader();
        this.utils.openToast(res["message"]);
        this.canLeave = true;
        this.navCtrl.pop();
      })
      .catch(() => {
        this.utils.stopLoader();
        this.utils.openToast("Rating Failed !!");
      });
  }

  presentConfirm(): void {
    let translateObject;
    this.translate
      .get(["actionSheet.confirmLeave", "actionSheet.ratingNotSaved", "actionSheet.cancel", "actionSheet.yes"])
      .subscribe((translations) => {
        translateObject = translations;
        console.log(JSON.stringify(translations));
      });
    const alert = this.alertCtrl.create({
      title: translateObject["actionSheet.ratingNotSaved"],
      message: translateObject["actionSheet.confirmLeave"],
      buttons: [
        {
          text: translateObject["actionSheet.cancel"],
          role: "cancel",
        },
        {
          text: translateObject["actionSheet.yes"],
          handler: () => {
            this.canLeave = true;
            this.navCtrl.pop();
          },
        },
      ],
    });
    alert.present();
  }

  ionViewCanLeave(): boolean {
    if (this.canLeave) {
      return true;
    } else {
      this.presentConfirm();
      return false;
    }
  }
}
