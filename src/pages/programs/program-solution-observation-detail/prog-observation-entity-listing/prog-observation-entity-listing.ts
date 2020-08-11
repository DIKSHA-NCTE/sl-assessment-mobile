import { Component, Input, Output, EventEmitter } from "@angular/core";
import {
  NavController,
  ModalController,
  Events,
  AlertController,
} from "ionic-angular";
import { SubmissionListPage } from "../../../submission-list/submission-list";
import { LocalStorageProvider } from "../../../../providers/local-storage/local-storage";
import { ProgramObservationSubmissionPage } from "../../program-observation-submission/program-observation-submission";
import { ApiProvider } from "../../../../providers/api/api";
import { AppConfigs } from "../../../../providers/appConfig";
import { EntityListPage } from "../../../observations/add-observation-form/entity-list/entity-list";
import { TranslateService } from "@ngx-translate/core";
import { UtilsProvider } from "../../../../providers/utils/utils";
import { ProgramServiceProvider } from "../../program-service";

/**
 * Generated class for the ProgObservationEntityListingComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: "prog-observation-entity-listing",
  templateUrl: "prog-observation-entity-listing.html",
})
export class ProgObservationEntityListingComponent {
  // @Input() entityList;
  // @Input() entityType;
  // @Input() showMenu = true;
  // @Output() getAssessmentDetailsEvent = new EventEmitter();
  // @Output() openMenuEvent = new EventEmitter();
  // @Output() refreshEvent = new EventEmitter();
  // @Input() selectedObservationIndex;
  // @Input() observationList;
  // copyOfEntityList: any;
  @Input() programIndex;
  @Input() solutionIndex;
  @Input() search;
  selectedSolution: any;
  programs: any;

  constructor(
    public navCtrl: NavController,
    public localStorage: LocalStorageProvider,
    private modalCtrl: ModalController,
    private apiProviders: ApiProvider,
    private events: Events,
    private translate: TranslateService,
    public alertCntrl: AlertController,
    private utils: UtilsProvider,
    private programService: ProgramServiceProvider
  ) {
    this.getLocalStorageData();
    console.log("called");
  }

  // ionViewWillEnter() {
  //   this.getLocalStorageData();
  //   console.log("called");
  // }

  getLocalStorageData() {
    this.localStorage
      .getLocalStorage("programList")
      .then((data) => {
        this.programs = data;
        this.selectedSolution =
          data[this.programIndex].solutions[this.solutionIndex];
      })
      .catch((error) => {
        // this.firstVisit = false;
      });
  }

  goToObservationSubmission(entityIndex) {
    let data = {
      programIndex: this.programIndex,
      solutionIndex: this.solutionIndex,
      entityIndex: entityIndex,
    };
    if (
      this.selectedSolution.entities[entityIndex].submissions &&
      this.selectedSolution.entities[entityIndex].submissions.length
    ) {
      this.navCtrl.push(ProgramObservationSubmissionPage, { data });
    } else {
      let event = {
        programIndex: this.programIndex,
        solutionIndex: this.solutionIndex,
        entityIndex: entityIndex,
        submission: {
          submissionNumber: 1,
          observationId: this.selectedSolution._id,
        },
      };

      this.programService
        .getAssessmentDetailsForObservation(event, this.programs)
        .then(async (programs) => {
          await this.programService.refreshObservationList();
          await this.getLocalStorageData();
          this.navCtrl.push(ProgramObservationSubmissionPage, { data });
        })
        .catch((err) => {});
    }
  }

  addEntity(...params) {
    // console.log(JSON.stringify(params))

    let entityListModal = this.modalCtrl.create(EntityListPage, {
      data: this.selectedSolution._id,
      solutionId: this.selectedSolution.solutionId,
    });
    entityListModal.onDidDismiss((entityList) => {
      if (entityList) {
        // console.log(JSON.stringify(entityList));
        let payload = {
          data: [],
        };
        entityList.forEach((element) => {
          payload.data.push(element._id);
        });
        // this.utils.startLoader();
        this.apiProviders.httpPost(
          AppConfigs.cro.mapEntityToObservation + this.selectedSolution._id,
          payload,
          async (success) => {
            await this.programService.refreshObservationList();

            this.getLocalStorageData();
            // this.utils.stopLoader();

            // entityList.forEach(entity => {
            //   entity.submissionStatus = "started";
            //   entity.downloaded = false;
            // })
            // this.entityList[0].entities = [...entityList, ...this.entityList[0].entities];
            // this.updatedLocalStorage.emit();
            console.log("refreshObservationListOnAddEntity getting called");
            this.events.publish("refreshObservationListOnAddEntity");
          },
          (error) => {
            // this.utils.stopLoader();
          }
        );
      }
    });
    entityListModal.present();
  }

  removeEntity(entityIndex) {
    console.log("remove entity called");
    let translateObject;
    this.translate
      .get([
        "actionSheet.confirm",
        "actionSheet.deleteEntity",
        "actionSheet.no",
        "actionSheet.yes",
      ])
      .subscribe((translations) => {
        translateObject = translations;
        console.log(JSON.stringify(translations));
      });
    let alert = this.alertCntrl.create({
      title: translateObject["actionSheet.confirm"],
      message: translateObject["actionSheet.deleteEntity"],
      buttons: [
        {
          text: translateObject["actionSheet.no"],
          role: "cancel",
          handler: () => {},
        },
        {
          text: translateObject["actionSheet.yes"],
          handler: () => {
            let obj = {
              data: [this.selectedSolution.entities[entityIndex]._id],
            };
            this.utils.startLoader();
            this.apiProviders.httpPost(
              AppConfigs.cro.unMapEntityToObservation +
                this.selectedSolution._id,
              obj,
              async (success) => {
                let okMessage;
                this.translate
                  .get("toastMessage.ok")
                  .subscribe((translations) => {
                    //  console.log(JSON.stringify(translations))

                    okMessage = translations;
                  });
                this.utils.openToast(success.message);

                this.utils.stopLoader();
                console.log(JSON.stringify(success));

                // this.entityList[params[0]].entities.splice(params[1], 1);
                // this.refreshEvent.emit();
                // this.updatedLocalStorage.emit(params[1]);

                await this.programService.refreshObservationList();
                this.getLocalStorageData();
              },
              (error) => {
                this.utils.stopLoader();

                console.log(JSON.stringify(error));
                console.log("error");
              }
            );
            // console.log(JSON.stringify(this.entityList));
          },
        },
      ],
    });
    alert.present();
  }

  // fileterList(ev) {
  //   const val = ev.target.value;
  //   let entityList = JSON.parse(JSON.stringify(this.copyOfEntityList));
  //   if (val && val.trim() != "") {
  //     entityList[0]["entities"] = entityList[0].entities.filter((item) => {
  //       return item.name.toLowerCase().indexOf(val.toLowerCase()) > -1;
  //     });
  //   }
  //   this.entityList = entityList;
  // }

  /* checkSubmission(entity, observationIndex, entityIndex) {
    const recentlyUpdatedEntity = {
      programName: this.observationList[this.selectedObservationIndex]
        .programId,
      ProgramId: this.observationList[this.selectedObservationIndex].programId,
      EntityName: this.observationList[this.selectedObservationIndex].entities[
        entityIndex
      ].name,
      EntityId: this.observationList[this.selectedObservationIndex].entities[
        entityIndex
      ]._id,
      isObservation: true,
    };
    // console.log(JSON.stringify(this.entityList))
    console.log("checking submission");
    console.log(this.selectedObservationIndex);
    if (
      this.entityList[observationIndex]["entities"][entityIndex].submissions &&
      this.entityList[observationIndex]["entities"][entityIndex].submissions
        .length > 0
    ) {
      console.log("submission there");
      this.navCtrl.push(SubmissionListPage, {
        observationIndex: observationIndex,
        entityIndex: entityIndex,
        selectedObservationIndex: this.selectedObservationIndex,
        recentlyUpdatedEntity: recentlyUpdatedEntity,
      });
    } else {
      console.log("no submission");

      let event = {
        entityIndex: entityIndex,
        observationIndex: this.selectedObservationIndex,
        submissionNumber: 1,
      };
      // this.utils.startLoader();
      return;
      this.assessmentService
        .getAssessmentDetailsOfCreatedObservation(
          event,
          this.observationList,
          "createdObservationList"
        )
        .then((result) => {
          this.observationService
            .refreshObservationList(this.observationList)
            .then((success) => {
              this.observationList = success;
              this.entityList[0] = success[this.selectedObservationIndex];

              this.navCtrl.push(SubmissionListPage, {
                observationIndex: observationIndex,
                entityIndex: entityIndex,
                selectedObservationIndex: this.selectedObservationIndex,
                recentlyUpdatedEntity: recentlyUpdatedEntity,
              });
            })
            .catch((error) => {});
        })
        .catch((error) => {});
    }
  } */
}
