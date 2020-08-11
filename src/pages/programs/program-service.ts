import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiProvider } from "../../providers/api/api";
import { LocalStorageProvider } from "../../providers/local-storage/local-storage";
import { UtilsProvider } from "../../providers/utils/utils";
import { AppConfigs } from "../../providers/appConfig";
import { UpdateLocalSchoolDataProvider } from "../../providers/update-local-school-data/update-local-school-data";
import { MenuItemComponent } from "../../components/menu-item/menu-item";
import { PopoverController } from "ionic-angular";
import { storageKeys } from "../../providers/storageKeys";
import { InstitutionServiceProvider } from "../institution/institution-service";

/*
  Generated class for the ProgramProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ProgramServiceProvider {
  constructor(
    public http: HttpClient,
    private apiService: ApiProvider,
    private localStorage: LocalStorageProvider,
    private utils: UtilsProvider,
    private ulsdp: UpdateLocalSchoolDataProvider,
    private popoverCtrl: PopoverController,
    private institutionService: InstitutionServiceProvider
  ) {
    console.log("Hello ProgramProvider Provider");
  }

  getProgramFromStorage() {
    // this.utils.startLoader();
    return this.localStorage
      .getLocalStorage("programList")
      .then((data) => {
        if (data) {
          return data;
        } else {
          return this.getProgramApi(true);
        }
      })
      .catch((error) => {
        return this.getProgramApi(true);
      });
  }

  getProgramApi(noLoader?: boolean) {
    return new Promise((resolve, reject) => {
      const url = AppConfigs.programs.programList;

      !noLoader ? this.utils.startLoader() : null;

      this.apiService.httpGet(
        url,
        (successData) => {
          // console.log("success data")
          !noLoader ? this.utils.stopLoader() : null;
          // console.log(JSON.stringify(successData))
          /*  for (const program of successData.result) {
            for (const solution of program.solutions) {
              for (const entity of solution.entities) {
                entity.downloaded = false;
                entity.submissionId = null;
              }
            }
          } */

          this.localStorage.setLocalStorage(storageKeys.programList, successData.result);
          resolve(successData.result);
        },
        (error) => {
          //console.log("error in list of assessment")
          // this.utils.stopLoader();
          !noLoader ? this.utils.stopLoader() : null;

          reject();
        }
      );
    });
  }
  //  for individual and instituional

  getAssessmentDetails(event, programs) {
    return new Promise((resolve, reject) => {
      let programIndex = event.programIndex;
      let assessmentIndex = event.assessmentIndex;
      let entityIndex = event.entityIndex;
      let solutionId = programs[programIndex].solutions[assessmentIndex]._id;
      let entityId = programs[programIndex].solutions[assessmentIndex].entities[entityIndex]._id;
      let submissionNumber = event.submissionNumber || 1;

      this.utils.startLoader();
      const url =
        AppConfigs.assessmentsList.detailsOfAssessment +
        programs[programIndex]._id +
        "?solutionId=" +
        solutionId +
        "&entityId=" +
        entityId +
        "&submissionNumber=" +
        submissionNumber;
      this.apiService.httpGet(
        url,
        async (success) => {
          this.ulsdp.mapSubmissionDataToQuestion(success.result);
          const generalQuestions = success.result["assessment"]["generalQuestions"]
            ? success.result["assessment"]["generalQuestions"]
            : null;
          this.localStorage.setLocalStorage(
            "generalQuestions_" + success.result["assessment"]["submissionId"],
            generalQuestions
          );
          this.localStorage.setLocalStorage(
            "generalQuestionsCopy_" + success.result["assessment"]["submissionId"],
            generalQuestions
          );
          // programs[programIndex].solutions[assessmentIndex].entities[
          //   entityIndex
          // ].downloaded = true;
          /* programs[programIndex].solutions[assessmentIndex].entities[
            entityIndex
          ].submissionId = success.result.assessment.submissionId; */
          /*   await this.ulsdp.updateSubmissionIdArr(
            success.result.assessment.submissionId,
            solutionId,
            entityId
          ); */
          /* if (submissionNumber) {
          } else {
            programs[programIndex].solutions[assessmentIndex].entities[
              entityIndex
            ].submissions[0].downloaded = true;
          } */
          await this.ulsdp.updateSubmissionIdArr(success.result.assessment.submissionId);

          await this.localStorage.setLocalStorage(
            this.utils.getAssessmentLocalStorageKey(success.result.assessment.submissionId),
            success.result
          );
          await this.localStorage.setLocalStorage(storageKeys.programList, programs);
          this.utils.stopLoader();

          resolve(programs);
        },
        (error) => {
          this.utils.stopLoader();
          reject();
        },
        { version: "v2" }
      );
    });
  }

  // for observation

  getAssessmentDetailsForObservation(event, programs) {
    return new Promise((resolve, reject) => {
      // let programIndex = event.programIndex;
      let programIndex = event.programIndex;
      let solutionIndex = event.solutionIndex;
      let entityIndex = event.entityIndex;
      // let schoolIndex = event.entityIndex;
      let submissionNumber = event.submission.submissionNumber;
      // let submissionId = event.submission.submissionId;
      let observationId = event.submission.observationId;

      this.utils.startLoader();
      const url =
        AppConfigs.cro.observationDetails +
        observationId +
        "?entityId=" +
        programs[programIndex].solutions[solutionIndex].entities[entityIndex]._id +
        "&submissionNumber=" +
        submissionNumber;
      console.log(url);
      this.apiService.httpGet(
        url,
        (success) => {
          this.ulsdp.mapSubmissionDataToQuestion(success.result, true);
          const generalQuestions = success.result["assessment"]["generalQuestions"]
            ? success.result["assessment"]["generalQuestions"]
            : null;
          this.localStorage.setLocalStorage(
            "generalQuestions_" + success.result["assessment"]["submissionId"],
            generalQuestions
          );
          this.localStorage.setLocalStorage(
            "generalQuestionsCopy_" + success.result["assessment"]["submissionId"],
            generalQuestions
          );

          /* programs[programIndex].solutions[assessmentIndex].entities[
            entityIndex
          ].submissions.map((s) => {
            s.submissionNumber == submissionNumber
              ? (s.downloaded = true)
              : null;
          }); */

          this.ulsdp.storeObsevationSubmissionId(success.result["assessment"]["submissionId"]);

          this.localStorage.setLocalStorage(
            this.utils.getAssessmentLocalStorageKey(success.result.assessment.submissionId),
            success.result
          );
          this.localStorage.setLocalStorage(storageKeys.programList, programs);
          this.utils.stopLoader();
          resolve(programs);
        },
        (error) => {
          //console.log("error details api")
          this.utils.stopLoader();
          reject();
        },
        { version: "v2" }
      );
    });
  }

  refreshObservationList(programs?: any, event?) {
    return new Promise((resolve, reject) => {
      this.apiService.httpGet(
        AppConfigs.programs.programList,
        async (success) => {
          let currList = success.result;
          this.localStorage.setLocalStorage(storageKeys.programList, currList);
          await this.institutionService.getInstitutionsflowApi();
          resolve(currList);
        },
        (error) => {
          reject();
        }
      );
    });
  }

  submissionListAll(solutionId, entityId) {
    return new Promise((resolve, reject) => {
      this.apiService.httpGet(
        AppConfigs.assessmentsList.submissionList + solutionId + "?entityId=" + entityId,
        (success) => {
          resolve(success.result);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }
  submissionListAllObs(observationId, entityId) {
    return new Promise((resolve, reject) => {
      this.apiService.httpGet(
        AppConfigs.cro.observationSubmissionAll + observationId + "?entityId=" + entityId,
        (success) => {
          resolve(success.result);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  openMenu(event, programs, showMenu?: any) {
    let myEvent = event.event;
    let programIndex = event.programIndex;
    let assessmentIndex = event.assessmentIndex;
    let entityIndex = event.entityIndex;
    let submissionId = event.submissionId;
    let showMenuArray;
    let solutionId = event.solutionId;
    let parentEntityId = event.parentEntityId;
    let createdByProgramId = event.createdByProgramId;

    this.localStorage
      .getLocalStorage(this.utils.getAssessmentLocalStorageKey(submissionId))
      .then((successData) => {
        if (showMenu) {
          showMenuArray = successData.solution.registry;
        } else {
          showMenuArray = [];
        }

        let popover = this.popoverCtrl.create(MenuItemComponent, {
          /*   submissionId:
            programs[programIndex].solutions[assessmentIndex].entities[
              entityIndex
            ].submissionId,
          _id: */
          submissionId: submissionId,
          _id: programs[programIndex].solutions[assessmentIndex].entities[entityIndex]["_id"],
          name: programs[programIndex].solutions[assessmentIndex].entities[entityIndex]["name"],
          programId: programs[programIndex]._id,
          showMenuArray: showMenuArray,
          solutionId: solutionId,
          parentEntityId: parentEntityId,
          createdByProgramId: createdByProgramId,
        });
        popover.present({
          ev: myEvent,
        });
      })
      .catch((error) => {});
  }

  /* 
    only for migration purpose to make downloaded = true for already downloaded entities in 
    previous app version before flow change 

    TODO :make migration more simpler and redable
    TODO :Use one array to store submissionIds for observations and assessments(individual and instituional) 
  */

  migrationFuntion() {
    let idsArr = [];
    this.localStorage
      .getLocalStorage(storageKeys.institutionalList)
      .then(
        (list) => {
          list.map((program) =>
            program.solutions.map((solution) =>
              solution.entities.map((entity) => {
                entity.downloaded ? idsArr.push(entity.submissionId) : null;
              })
            )
          );
          return this.localStorage.getLocalStorage(storageKeys.individualList);
        },
        (noList) => {
          return this.localStorage.getLocalStorage(storageKeys.individualList);
        }
      )
      .then(
        (list) => {
          list.map((program) =>
            program.solutions.map((solution) =>
              solution.entities.map((entity) => {
                entity.downloaded ? idsArr.push(entity.submissionId) : null;
              })
            )
          );
        },
        (noList) => {}
      )
      .then(() => {
        idsArr.length ? this.ulsdp.updateSubmissionIdArr(idsArr) : null;
      })
      .then(() => {
        this.localStorage.deleteOneStorage(storageKeys.institutionalList);
        this.localStorage.deleteOneStorage(storageKeys.individualList);
        this.runObservationMigration();
      })
      .catch(() => {});
  }

  runObservationMigration() {
    let idsArr = [];
    this.localStorage
      .getLocalStorage(storageKeys.createdObservationList)
      .then((list) => {
        console.log(list);
        list.map((program) =>
          program.entities.map((entity) =>
            entity.submissions.map((submission) => {
              submission.downloaded ? idsArr.push(submission._id) : null;
            })
          )
        );
        idsArr.length ? this.ulsdp.storeObsevationSubmissionId(idsArr) : null;
        this.localStorage.deleteOneStorage(storageKeys.createdObservationList);
      })
      .catch((err) => console.log(err));
  }

  /*----------------- migration steps end------------- */
}
