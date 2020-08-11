import { Injectable } from "@angular/core";
import { AppConfigs } from "../appConfig";
import { ApiProvider } from "../api/api";
import { LocalStorageProvider } from "../local-storage/local-storage";
import { UtilsProvider } from "../utils/utils";
import { UpdateLocalSchoolDataProvider } from "../update-local-school-data/update-local-school-data";
import { MenuItemComponent } from "../../components/menu-item/menu-item";
import { PopoverController } from "ionic-angular";

/*
  Generated class for the AssessmentServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AssessmentServiceProvider {
  constructor(
    private apiService: ApiProvider,
    private localStorage: LocalStorageProvider,
    private ulsdp: UpdateLocalSchoolDataProvider,
    private popoverCtrl: PopoverController,
    private utils: UtilsProvider
  ) {
    console.log("Hello AssessmentServiceProvider Provider");
  }

  getAssessmentsApi(assessmentType, noLoader?: boolean) {
    return new Promise((resolve, reject) => {
      // console.log(assessmentType + " list api called");
      const url = AppConfigs.assessmentsList.listOfAssessment + assessmentType;
      // let programs;
      // console.log(url)
      !noLoader ? this.utils.startLoader() : null;

      //console.log("List api called ")
      this.apiService.httpGet(
        url,
        (successData) => {
          // console.log("success data")
          !noLoader ? this.utils.stopLoader() : null;
          // console.log(JSON.stringify(successData))
          for (const program of successData.result) {
            for (const solution of program.solutions) {
              for (const entity of solution.entities) {
                entity.downloaded = false;
                entity.submissionId = null;
              }
            }
          }
          // programs = successData.result;

          this.localStorage.setLocalStorage(
            `${assessmentType}List`,
            successData.result
          );
          // console.log(JSON.stringify(programs))
          resolve(successData.result);
        },
        (error) => {
          //console.log("error in list of assessment")
          // this.utils.stopLoader();
          !noLoader ? this.utils.stopLoader() : null;

          reject();
        }
      );

      //console.log("function end")
    });
  }

  refresh(programs, assessmentType, event?: any) {
    return new Promise((resolve, reject) => {
      const url = AppConfigs.assessmentsList.listOfAssessment + assessmentType;
      // const url = AppConfigs.survey.fetchIndividualAssessments + "?type=assessment&subType=individual&status=active";
      event ? "" : this.utils.startLoader();
      this.apiService.httpGet(
        url,
        (successData) => {
          const downloadedAssessments = [];
          const currentPrograms = successData.result;
          for (const program of programs) {
            for (const solution of program.solutions) {
              for (const entity of solution.entities) {
                if (entity.downloaded) {
                  downloadedAssessments.push({
                    id: entity._id,
                    submissionId: entity.submissionId,
                  });
                }
              }
            }
          }

          //console.log(JSON.stringify(downloadedAssessments))

          if (!downloadedAssessments.length) {
            programs = successData.result;
            this.localStorage.setLocalStorage(
              `${assessmentType}List`,
              successData.result
            );
            event ? event.complete() : this.utils.stopLoader();

            resolve(programs);
          } else {
            for (const program of currentPrograms) {
              for (const solution of program.solutions) {
                for (const entity of solution.entities) {
                  downloadedAssessments.forEach((element) => {
                    if (element.id === entity._id) {
                      entity.downloaded = true;
                      entity.submissionId = element.submissionId;
                    }
                  });
                  // if (downloadedAssessments.indexOf(entity._id) >= 0) {
                  //   entity.downloaded = true;
                  // }
                }
              }
            }
            programs = currentPrograms;
            this.localStorage.setLocalStorage(
              `${assessmentType}List`,
              currentPrograms
            );
            event ? event.complete() : this.utils.stopLoader();

            resolve(programs);
          }
        },
        (error) => {
          reject();
        }
      );
    });
  }

  getAssessmentDetails(event, programs, assessmentType) {
    return new Promise((resolve, reject) => {
      let programIndex = event.programIndex;
      let assessmentIndex = event.assessmentIndex;
      let schoolIndex = event.entityIndex;

      // console.log(programIndex + " " + assessmentIndex + " " + schoolIndex)
      this.utils.startLoader();
      const url =
        AppConfigs.assessmentsList.detailsOfAssessment +
        programs[programIndex]._id +
        "?solutionId=" +
        programs[programIndex].solutions[assessmentIndex]._id +
        "&entityId=" +
        programs[programIndex].solutions[assessmentIndex].entities[schoolIndex]
          ._id;
      //console.log(url);
      this.apiService.httpGet(
        url,
        (success) => {
          this.ulsdp.mapSubmissionDataToQuestion(success.result);
          const generalQuestions = success.result["assessment"][
            "generalQuestions"
          ]
            ? success.result["assessment"]["generalQuestions"]
            : null;
          this.localStorage.setLocalStorage(
            "generalQuestions_" + success.result["assessment"]["submissionId"],
            generalQuestions
          );
          this.localStorage.setLocalStorage(
            "generalQuestionsCopy_" +
              success.result["assessment"]["submissionId"],
            generalQuestions
          );
          programs[programIndex].solutions[assessmentIndex].entities[
            schoolIndex
          ].downloaded = true;
          programs[programIndex].solutions[assessmentIndex].entities[
            schoolIndex
          ].submissionId = success.result.assessment.submissionId;
          this.localStorage.setLocalStorage(
            this.utils.getAssessmentLocalStorageKey(
              programs[programIndex].solutions[assessmentIndex].entities[
                schoolIndex
              ].submissionId
            ),
            success.result
          );
          this.localStorage.setLocalStorage(`${assessmentType}List`, programs);
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

  getAssessmentDetailsOfCreatedObservation(event, programs, assessmentType) {
    return new Promise((resolve, reject) => {
      // let programIndex = event.programIndex;
      let schoolIndex = event.entityIndex;
      let submissionIndex = event.submissionNumber
        ? event.submissionNumber
        : event.submissionIndex;
      this.utils.startLoader();
      // console.log(JSON.stringify(event.entityIndex))
      // console.log(JSON.stringify(programs[event.observationIndex]['entities'][0]))

      // const url = AppConfigs.assessmentsList.detailsOfAssessment + programs[event.observationIndex]._id + "?solutionId=" + programs[event.observationIndex].solutionId + "&entityId=" +programs[event.observationIndex].entities[schoolIndex]._id;
      const url = event.submissionNumber
        ? AppConfigs.cro.observationDetails +
          programs[event.observationIndex]._id +
          "?entityId=" +
          programs[event.observationIndex].entities[schoolIndex]._id +
          "&submissionNumber=" +
          event.submissionNumber
        : AppConfigs.cro.observationDetails +
          programs[event.observationIndex]._id +
          "?entityId=" +
          programs[event.observationIndex].entities[schoolIndex]._id +
          "&submissionNumber=" +
          programs[event.observationIndex].entities[schoolIndex]["submissions"][
            submissionIndex
          ].submissionNumber;
      console.log(url);
      this.apiService.httpGet(
        url,
        (success) => {
          this.ulsdp.mapSubmissionDataToQuestion(success.result, true);
          const generalQuestions = success.result["assessment"][
            "generalQuestions"
          ]
            ? success.result["assessment"]["generalQuestions"]
            : null;
          this.localStorage.setLocalStorage(
            "generalQuestions_" + success.result["assessment"]["submissionId"],
            generalQuestions
          );
          this.localStorage.setLocalStorage(
            "generalQuestionsCopy_" +
              success.result["assessment"]["submissionId"],
            generalQuestions
          );

          event.submissionNumber
            ? null
            : (programs[event.observationIndex]["entities"][schoolIndex][
                "submissions"
              ][submissionIndex].downloaded = true);
          // programs[event.observationIndex]['entities'][schoolIndex].submissionId = success.result.assessment.submissionId;
          this.localStorage.setLocalStorage(
            this.utils.getAssessmentLocalStorageKey(
              success.result.assessment.submissionId
            ),
            success.result
          );
          this.localStorage.setLocalStorage(assessmentType, programs);
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

  openMenu(event, programs, showMenu?: any) {
    let myEvent = event.event;
    let programIndex = event.programIndex;
    let assessmentIndex = event.assessmentIndex;
    let schoolIndex = event.entityIndex;
    let submissionId = event.submissionId;
    let showMenuArray;
    let solutionId = event.solutionId;
    let parentEntityId = event.parentEntityId;
    let createdByProgramId = event.createdByProgramId;
    //console.log(" id related to this page");
    //console.log(solutionId);
    //console.log(parentEntityId);
    //console.log(createdByProgramId);

    this.localStorage
      .getLocalStorage(this.utils.getAssessmentLocalStorageKey(submissionId))
      .then((successData) => {
        if (showMenu) {
          showMenuArray = successData.solution.registry;
        } else {
          showMenuArray = [];
        }

        let popover = this.popoverCtrl.create(MenuItemComponent, {
          submissionId:
            programs[programIndex].solutions[assessmentIndex].entities[
              schoolIndex
            ].submissionId,
          _id:
            programs[programIndex].solutions[assessmentIndex].entities[
              schoolIndex
            ]["_id"],
          name:
            programs[programIndex].solutions[assessmentIndex].entities[
              schoolIndex
            ]["name"],
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
}
