import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiProvider } from '../api/api';
import { AppConfigs } from '../appConfig';

@Injectable()
export class OnboardingProvider {

  constructor(public http: HttpClient, private apiService: ApiProvider) {
  }

  getState(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.apiService.httpGet(AppConfigs.onBoarding.stateList, success => {
        resolve(success)
      }, error => {
        reject(error)
      },
        { baseUrl: "kendra", version: "v1" })
    })
  }

  getRolesForState(id): Promise<any> {
    return new Promise((resolve, reject) => {
      this.apiService.httpGet(AppConfigs.onBoarding.rolesForState + id, success => {
        resolve(success)
      }, error => {
        reject(error)
      },
        { baseUrl: "kendra" })
    })
  }

  getSubEntitiesForm(params): Promise<any> {
    return new Promise((resolve, reject) => {
      this.apiService.httpGet(AppConfigs.onBoarding.subEntitiesForm + params, success => {
        resolve(success)
      }, error => {
        reject(error)
      },
        { baseUrl: "kendra" })
    })
  }

  getSubEntitieList(params): Promise<any> {
    return new Promise((resolve, reject) => {
      this.apiService.httpGet(AppConfigs.onBoarding.subEntityList + params, success => {
        resolve(success)
      }, error => {
        reject(error)
      },
        { baseUrl: "kendra" })
    })
  }

  profileUpdate(payload): Promise<any> {
    return new Promise((resolve, reject) => {
      this.apiService.httpPost(AppConfigs.onBoarding.profileUpdate, payload, success => {
        resolve(success)
      }, error => {
        reject(error)
      },
        { baseUrl: "kendra" })
    })
  }


  getProfile(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.apiService.httpGet(AppConfigs.onBoarding.getProfile, success => {
        resolve(success)
      }, error => {
        reject(error)
      },
        { baseUrl: "kendra", version: 'v2' })
    })
  }
}
