import { Injectable } from "@angular/core";
import { AppConfigs } from "../../../providers/appConfig";
import { ApiProvider } from "../../../providers/api/api";

/*
  Generated class for the TrashProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class TrashProvider {
  restoreSolFromTrash(solutionId: any) {
    const url = AppConfigs.trash.restoreSol + solutionId ;
    return new Promise((resolve, reject) => {
      this.apiService.httpGet(
        url,
        (success) => {
          resolve(success);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }
  constructor(public apiService: ApiProvider) {
    console.log("Hello TrashProvider Provider");
  }

  getTrashSolList() {
    const url = AppConfigs.trash.trashList;
    return new Promise((resolve, reject) => {
      this.apiService.httpGet(
        url,
        (success) => {
          resolve(success.result);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }
}
