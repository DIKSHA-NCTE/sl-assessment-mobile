import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs/Subject";
import { LocalStorageProvider } from "../local-storage/local-storage";
import { CurrentUserProvider } from "../current-user/current-user";
import { ApiProvider } from "../api/api";
import { AppConfigs } from "../appConfig";
import { UtilsProvider } from "../utils/utils";
import { storageKeys } from "../storageKeys";

@Injectable()
export class SidemenuProvider {
  $showDashboard = new Subject<boolean>();
  profileRoles;

  constructor(
    public http: HttpClient,
    private localStorage: LocalStorageProvider,
    private currentUser: CurrentUserProvider,
    private apiProvider: ApiProvider,
    private utils: UtilsProvider
  ) {
    console.log("Hello SidemenuProvider Provider");
  }

  getUserRoles() {
    this.localStorage
      .getLocalStorage(storageKeys.profileRole)
      .then((success) => {
        this.profileRoles = success;
       
        this.$showDashboard.next(success.roles.length > 0 ? true : false);
      })
      .catch((error) => {
        this.getUserRolesApi();
      });
  }

  getUserRolesApi() {
    let currentUser = this.currentUser.getCurrentUserData();
    currentUser = currentUser ? currentUser.sub.split(":").pop() : null;
    this.apiProvider.httpGet(
      AppConfigs.roles.getProfile + currentUser,
      async (success) => {
        this.profileRoles = success.result;
        await this.localStorage.setLocalStorage("profileRole", this.profileRoles);

       
        this.$showDashboard.next(success.result.roles && success.result.roles.length > 0 ? true : false); 
      

        if (this.profileRoles.relatedEntities && this.profileRoles.relatedEntities.length) {
          let relatedEntities = this.profileRoles.relatedEntities;
          let stateEntry = relatedEntities.filter((e) => (e.entityType = "state"));
          this.getEntityToObserve(stateEntry[0]._id);
        }
      },
      (error) => {
        this.$showDashboard.next(false);
        this.utils.openToast(error);
      }
    );
  }

  getEntityToObserve(stateId) {
    this.apiProvider.httpGet(
      AppConfigs.entity.entityToBeObserved + stateId,
      (success) => {
        console.log(success);
        this.localStorage.setLocalStorage(storageKeys.observableEntities, success.result);
      },
      (error) => {},
      { version: "v1" }
    );
  }
}
