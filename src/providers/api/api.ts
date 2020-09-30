
import { Http, URLSearchParams, Headers } from '@angular/http';

import { Injectable } from '@angular/core';
import { App, AlertController, Platform } from 'ionic-angular';
import { HTTP } from '@ionic-native/http';

import { CurrentUserProvider } from '../current-user/current-user';
import { AppConfigs } from '../appConfig';
import { WelcomePage } from '../../pages/welcome/welcome';
import { UtilsProvider } from '../utils/utils';
// import { AuthProvider } from '../auth/auth';
import { NetworkGpsProvider } from '../network-gps/network-gps';
import { SlackProvider } from '../slack/slack';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class ApiProvider {

  constructor(public http: HTTP,
    public currentUser: CurrentUserProvider,
    private appCtrls: App,
    private utils: UtilsProvider,
    private alertCntrl: AlertController,
    private translate: TranslateService,
    private ngps: NetworkGpsProvider,
    private slack: SlackProvider,
    private platform : Platform,
    private ngHttp: Http
  ) {
  }

  errorObj = {
    "fallback": "User Details",
    "title": `Error Details`,
    "text": ``
  }

  errorTokenRetryCount: number = 0;

  isNetworkAvailabel(): boolean {
    return this.ngps.getNetworkStatus()
  }


  validateApiToken(): Promise<any> {
     this.http.setDataSerializer("urlencoded");
     this.http.setRequestTimeout(300);
     return new Promise((resolve, reject) => {
       const userDetails = this.currentUser.getCurrentUserData();
       if (userDetails.exp <= Date.now() / 1000) {
         const url = AppConfigs.app_url + AppConfigs.keyCloak.getAccessToken;
         const header = {
         
         };
         let body = {
           grant_type: "refresh_token",
           client_id: AppConfigs.clientId,
           refresh_token: this.currentUser.curretUser.refreshToken,
         };

         this.http
           .post(url, body, header)
           .then((data) => {
             console.log(data);
             // let parsedData = JSON.parse(data["_body"]);
             let parsedData = JSON.parse(data["data"]);
             let userTokens = {
               accessToken: parsedData.access_token,
               refreshToken: parsedData.refresh_token,
               idToken: parsedData.id_token,
             };
             this.currentUser.setCurrentUserDetails(userTokens);
             resolve();
           })
           .catch((error) => {
             reject({ status: "401" });
           });
       } else {
         resolve();
       }
     });
  }

  refershToken(): Promise<any> {
    this.http.setDataSerializer('json');
    const body = new URLSearchParams();
    body.set('grant_type', "refresh_token");
    // body.set('refresh_token', this.currentUser.curretUser.refreshToken);
    body.set('client_id', AppConfigs.clientId);
    body.set('client_secret', AppConfigs.api_key);
    return new Promise((resolve, reject) => {
      const obj = 'grant_type=refresh_token&refresh_token=' + this.currentUser.curretUser.refreshToken + "&client_id=" + AppConfigs.clientId;
      const url = AppConfigs.app_url + AppConfigs.keyCloak.getAccessToken;
      const headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' })
      this.ngHttp.post(url, obj, { headers: headers }).subscribe(data => {
        let parsedData = JSON.parse(data['_body']);
        if (parsedData && parsedData.access_token) {
          let userTokens = {
            accessToken: parsedData.access_token,
            refreshToken: this.currentUser.curretUser.refreshToken,
          };
          this.currentUser.setCurrentUserDetails(userTokens);
          resolve()
        } else {
          reject();
        }
        // if(parsedData.error === 'invalid_grant'){
        //   reject();
        // } else {
        //   let userTokens = {
        //     accessToken: parsedData.access_token,
        //     refreshToken: this.currentUser.curretUser.refreshToken,
        //   };
        //   this.currentUser.setCurrentUserDetails(userTokens);
        //   resolve()
        // }
      }, error => {
        reject();
      })
    })
  }

  OnTokenExpired(url, payload, successCallback, errorCallback, requestType, config?) {
    const apiUrl = this.getApiUrl(url, config);
    if (this.errorTokenRetryCount >= 3) {
      errorCallback({});
      const errorObject = { ...this.errorObj };
      errorObject.text = `API failed. URL: ${apiUrl}. Error  Details ${JSON.stringify(errorObject)}.Toke expired. Relogin enabled.`;
      this.slack.pushException(errorObject);
      this.translate.get(['toastMessage.someThingWentWrongTryLater', 'toastMessage.ok']).subscribe(translations => {
        this.utils.openToast(translations.someThingWentWrongTryLater, translations.ok);
      })

      this.doLogout().then(success => {
        this.reLoginAlert();
      }).catch(error => {
      })
    } else {
      this.refershToken().then(success => {
        if (requestType === 'post') {
          this.httpPost(url, payload, successCallback, errorCallback)
        } else {
          this.httpGet(url, successCallback, errorCallback)
        }
      }).catch(error => {
        const errorObject = { ...this.errorObj };
        errorObject.text = `API failed. URL: ${apiUrl}. Error  Details ${JSON.stringify(error)}. Payload: ${JSON.stringify(payload)}.`;
        this.slack.pushException(errorObject);
        this.translate.get(['toastMessage.someThingWentWrongTryLater', 'toastMessage.ok']).subscribe(translations => {
          this.utils.openToast(translations.someThingWentWrongTryLater, translations.ok);
        })
        errorCallback(error);
        this.doLogout().then(success => {
          this.reLoginAlert();
        }).catch(error => {
        })
      })
    }
  }


  httpPost(url, payload, successCallback, errorCallback, config?) {
    // let nav = this.appCtrls.getActiveNav();
    let options = {};
    options['version'] = (config && config.version && config.version.trim() !== "" )? config.version :"v1";
    options['dhiti'] = (config && config.dhiti ) ? config.dhiti :false;
    this.validateApiToken().then(response => {
      const gpsLocation = this.ngps.getGpsLocation()
      const obj = {
        "x-auth-token": this.currentUser.curretUser.accessToken,
        "x-authenticated-user-token": this.currentUser.curretUser.accessToken,
        gpsLocation: gpsLocation ? gpsLocation : "",
        appVersion: AppConfigs.appVersion,
        appName: AppConfigs.appName.toLowerCase().replace(/([^a-zA-Z])/g, ""),
        appType: "assessment",
        os: this.platform.is("ios") ? "ios" : "android",
      };
      // const apiUrl = AppConfigs.api_base_url + url;
      const apiUrl = this.getApiUrl(url, config);

      // const apiUrl = options['dhiti'] ? AppConfigs.dhiti_base_url + options['version'] + url : AppConfigs.api_base_url + options['version'] + url;
      console.log(apiUrl,"apiUrl")
      // console.log(JSON.stringify(payload))
      this.http.setDataSerializer('json');
      this.http.post(apiUrl, payload, obj).then(data => {
        successCallback(data.data ? JSON.parse(data.data) : null);
      }).catch(error => {
        const errorDetails = JSON.parse(error['error']);
        if (errorDetails.status === "ERR_TOKEN_INVALID") {
          this.errorTokenRetryCount++;
          this.OnTokenExpired(url, payload, successCallback, errorCallback, "post", config);
        } else {
          this.utils.openToast(errorDetails.message, 'Ok');
          const errorObject = { ...this.errorObj };
          errorObject.text = `API failed. URL: ${apiUrl}. Error  Details ${JSON.stringify(error)}. Payload: ${JSON.stringify(payload)}.`;
          this.slack.pushException(errorObject);
        }
        errorCallback(JSON.parse(error['error']))
      })
    }).catch(error => {
      console.log(error,"error 200");
      this.OnTokenExpired(url, payload, successCallback, errorCallback, "post", config);
    })
  }


  httpGet(url, successCallback, errorCallback, config?) {
    // console.log("httpget" + JSON.stringify(options))
    // if(options && options.version){
      let options = {};
      options['version'] = (config && config.version && config.version.trim() !== "" )? config.version :"v1";
      options['dhiti'] = (config && config.dhiti ) ? config.dhiti :false;
    // }
    this.validateApiToken().then(response => {
      const gpsLocation = this.ngps.getGpsLocation();
      const obj = {
        "x-auth-token": this.currentUser.curretUser.accessToken,
        "x-authenticated-user-token": this.currentUser.curretUser.accessToken,
        gpsLocation: gpsLocation ? gpsLocation : "",
        appVersion: AppConfigs.appVersion,
        appName: AppConfigs.appName.toLowerCase().replace(/([^a-zA-Z])/g, ""),
        os: this.platform.is("ios") ? "ios" : "android",
        appType: "assessment",
      };
      this.http.setDataSerializer('json');
      const apiUrl = this.getApiUrl(url, config);
      console.log(apiUrl)
      this.http.get(apiUrl, {}, obj).then(data => {
        successCallback(data.data ? JSON.parse(data.data) : null);
        console.log("success data")
      }).catch(error => {
        errorCallback(error)
        const errorDetails = error['error'] ? JSON.parse(error['error']) : error;
        if (errorDetails.status === "ERR_TOKEN_INVALID") {
          this.errorTokenRetryCount++;
          this.OnTokenExpired(url, " ", successCallback, errorCallback, "get", config);
        } else {
          this.translate.get('toastMessage.ok').subscribe(translations => {
            this.utils.openToast(errorDetails.message, translations);
            errorCallback(error)
          })
          const errorObject = { ...this.errorObj };
          errorObject.text = `API failed. URL: ${apiUrl}. Error  Details ${JSON.stringify(error)}`;
          this.slack.pushException(errorObject);
        }
      })
    }).catch(error => {
      this.OnTokenExpired(url, " ", successCallback, errorCallback, "get", config);
    })
  }

  getApiUrl(url, config?) {
    let version = (config && config['version'] )? config['version'] : 'v1';
    if (config && config.baseUrl &&  config.baseUrl === 'dhiti') {
      return AppConfigs.dhiti_base_url + version + url;
    } else if (config && config.baseUrl && config.baseUrl === 'kendra') {
      return AppConfigs.kendra_base_url + version + url;
    } else {
      return AppConfigs.api_base_url + version + url;
    }
  }

  reLoginAlert() {
    this.currentUser.deactivateActivateSession(true);
    let nav = this.appCtrls.getRootNav();
    nav.setRoot(WelcomePage);
    let translateObject;
    this.translate.get(['actionSheet.sessionExpired', 'actionSheet.login']).subscribe(translations => {
      translateObject = translations;
      console.log(JSON.stringify(translations))
    })
    let alert = this.alertCntrl.create({
      title: translateObject['actionSheet.sessionExpired'],
      buttons: [
        {
          text: translateObject['actionSheet.login'],
          role: 'role',
          handler: data => { }
        }
      ],
      enableBackdropDismiss: false
    });
    alert.present();
  }

  doLogout(): Promise<any> {
    return new Promise(function (resolve) {
      let logout_redirect_url = AppConfigs.keyCloak.logout_redirect_url;
      let logout_url = AppConfigs.app_url + "/auth/realms/sunbird/protocol/openid-connect/logout?redirect_uri=" + logout_redirect_url;
      console.log(logout_url);

      let closeCallback = function (event) {
      };

      let browserRef = (<any>window).cordova.InAppBrowser.open(logout_url, "_blank", "zoom=no");
      browserRef.addEventListener('loadstart', function (event) {
        console.log('in listener')
        if (event.url && ((event.url).indexOf(logout_redirect_url) === 0)) {
          browserRef.removeEventListener("exit", closeCallback);
          browserRef.close();
          console.log(event.url);
          resolve()
        }
      });

    });
  }

  getLocalJson(url) {
    console.log(url);
    return this.ngHttp.get(url);
    // this.ngHttp.get("assets/addObservation.json").subscribe(data => {
    // }).catch(error => {

    //   console.log(JSON.stringify(error));
    //   const errorDetails = error['error'] ? JSON.parse(error['error']) : error ;
    //   if (errorDetails.status === "ERR_TOKEN_INVALID") {
    //     this.errorTokenRetryCount++;
    //   } else {
    //     this.utils.openToast(error.message, 'Ok');
    //     const errorObject = { ...this.errorObj };
    //     errorObject.text = `API failed. URL: ${url}. Error  Details ${JSON.stringify(error)}`;
    //     this.slack.pushException(errorObject);
    //   }
    // })
    // console.log(url);

    // this.http.get(url , { } , {}).then(data => 
    //   {
    //     console.log("function sucess");
    //     console.log(JSON.stringify(data.data));
    //   successCallback(JSON.parse(data.data));

    //   }).catch( error =>{

    //   });  
  }
} 
