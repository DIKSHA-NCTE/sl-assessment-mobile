import { Http, URLSearchParams, Headers } from '@angular/http';

import { Injectable } from '@angular/core';
import { CurrentUserProvider } from '../current-user/current-user';
import { AppConfigs } from '../appConfig';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import { App, AlertController } from 'ionic-angular'
import { WelcomePage } from '../../pages/welcome/welcome';
import { UtilsProvider } from '../utils/utils';
import { AuthProvider } from '../auth/auth';
import { NetworkGpsProvider } from '../network-gps/network-gps';


@Injectable()
export class ApiProvider {

  constructor(public http: Http,
    public currentUser: CurrentUserProvider,
    private appCtrls: App, private utils: UtilsProvider,
    private auth: AuthProvider,
    private alertCntrl: AlertController,
    private ngps: NetworkGpsProvider) {
  }

  isNetworkAvailabel(): boolean {
    return this.ngps.getNetworkStatus()
  }
  validateApiToken(): Promise<any> {
    return new Promise((resolve, reject) => {
      //console.log("Utils: validate token");
      const userDetails = this.currentUser.getCurrentUserData();
      //console.log(userDetails.exp + ' ' + Date.now);
      if (userDetails.exp <= (Date.now() / 1000)) {
        //console.log("Utils: invalid token")
        const body = new URLSearchParams();
        body.set('grant_type', "refresh_token");
        body.set('client_id', AppConfigs.clientId);
        body.set('refresh_token', this.currentUser.curretUser.refreshToken);
        //console.log(this.currentUser.curretUser.refreshToken);
        const url = AppConfigs.app_url + AppConfigs.keyCloak.getAccessToken;
        //console.log(url)

        this.http.post(url, body).subscribe((data: any) => {
          //console.log("Utils: received validated token")
          //console.log(data._body)
          let parsedData = JSON.parse(data._body);
          let userTokens = {
            accessToken: parsedData.access_token,
            refreshToken: parsedData.refresh_token,
            idToken: parsedData.id_token
          };
          this.currentUser.setCurrentUserDetails(userTokens);
          resolve()
        }, error => {
          // this.currentUser.removeUser();
          //console.log('Utils: Logout,token invalid');
          //console.log('error ' + JSON.stringify(error));
          // this.doLogout();
          reject({ status: '401' });
        });
      } else {
        //console.log("Utils: valid token")
        resolve();
      }
    })

  }

  httpPost(url, payload, successCallback, errorCallback) {
    let nav = this.appCtrls.getActiveNav();

    this.validateApiToken().then(response => {
      //console.log('SUCcess');
      const gpsLocation = this.ngps.getGpsLocation()

      const obj = {
        'x-authenticated-user-token': this.currentUser.curretUser.accessToken,
        'gpsLocation': gpsLocation ? gpsLocation : '0,0'
      }
      let headers = new Headers(obj);
      // let headers = new Headers();
      // const gpsLocation =  this.ngps.getGpsLocation();
      // headers.append('x-authenticated-user-token', this.currentUser.curretUser.accessToken);
      // headers.append('gpsLocation', gpsLocation);

      console.log(AppConfigs.api_base_url + url)
      const apiUrl = AppConfigs.api_base_url + url;
      this.http.post(apiUrl, payload, { headers: headers })
        .subscribe(data => {
          //console.log('API service success')
          successCallback(JSON.parse(data['_body']));
        }, error => {
          // this.auth.doLogout().then(success => {
          //   nav.setRoot(WelcomePage);
          //   this.currentUser.deactivateActivateSession(true);
          //   this.utils.openToast('Session expired. Please login again to continue', 'Ok');
          //   errorCallback(error);

          // }).catch(error => {

          // })
          console.dir(JSON.stringify(error))
          this.utils.openToast("Something went wrong.", 'Ok');

          // const errorDetails = JSON.parse(error['_body']);
          // if (errorDetails.status === "ERR_TOKEN_INVALID") {
          //   //console.log(JSON.stringify(error))
          //   this.auth.doLogout().then(success => {
          //     this.reLoginAlert();
          //   }).catch(error => {
          //   })
          // } else {
          //   this.utils.openToast("Something went wrong.", 'Ok');
          // }


          errorCallback(error);
        })
    }).catch(error => {
      //console.log('ERRor')
      this.utils.openToast("Something went wrong.", 'Ok');

      //console.log(JSON.stringify(error))
      errorCallback(error);
      // this.doLogout();
    })
  }

  httpPut(url, payload, successCallback, errorCallback) {
    // this.validateApiToken().then(response => {
    //console.log('SUCcess');
    let headers = new Headers();
    headers.append("Content-type", 'image/jpeg');
    console.log(url)
    const apiUrl = url;
    this.http.put(apiUrl, payload, { headers: headers }).subscribe(data => {
      //console.log('API service success')
      successCallback(JSON.parse(data['_body']));
    })
    // }).catch(error => {
    //   //console.log('ERRor')
    //   //console.log(JSON.stringify(error))
    //   errorCallback(error);
    // })
  }

  reLoginAlert() {
    let alert = this.alertCntrl.create({
      title: 'Session has expired. Please login again to continue',
      buttons: [
        {
          text: 'Login',
          role: 'role',
          handler: data => {
            this.currentUser.deactivateActivateSession(true);
            let nav = this.appCtrls.getRootNav();
            // nav.setRoot(WelcomePage);
            // nav.push(WelcomePage);
            // this.appCtrls.getRootNav().push(WelcomePage);
            nav.setRoot(WelcomePage);
            // window.location.reload();
            // this.appCtrls.getActiveNav().setRoot(WelcomePage);
          }
        }
      ],
      enableBackdropDismiss: false
    });
    alert.present();
  }

  httpGet(url, successCallback, errorCallback) {
    let nav = this.appCtrls.getActiveNav();

    this.validateApiToken().then(response => {
      //console.log('SUCcess');
      const gpsLocation = this.ngps.getGpsLocation()

      const obj = {
        'x-authenticated-user-token': this.currentUser.curretUser.accessToken,
        'gpsLocation': gpsLocation ? gpsLocation : '0,0'
      }
      let headers = new Headers(obj);
      //console.log(gpsLocation)
      // headers.append({'x-authenticated-user-token': this.currentUser.curretUser.accessToken});
      // headers.append('gpsLocation', "test");

      //console.log(JSON.stringify(headers))
      const apiUrl = AppConfigs.api_base_url + url;
      this.http.get(apiUrl, { headers: headers })
        .subscribe(data => {
          //console.log('API service success');
          // //console.log(data)
          successCallback(JSON.parse(data['_body']));
        }, error => {
          //console.log(error.status)
          const errorDetails = JSON.parse(error['_body']);
          if (errorDetails.status === "ERR_TOKEN_INVALID") {
            //console.log(JSON.stringify(error))
            this.auth.doLogout().then(success => {
              this.reLoginAlert();
            }).catch(error => {
            })
          } else {
            this.utils.openToast(error.message, 'Ok');
          }
          this.utils.openToast(error.message, 'Ok');

          errorCallback(error);
        })
    }).catch(error => {
      //console.log('ERRor');
      // this.doLogout();
      //console.log(JSON.stringify(error))
      this.utils.openToast("Something went wrong.", 'Ok');
      errorCallback(error);
    })
  }

  httpGetJoin(urls, successCallback) {
    //console.log('Joiin');
    let requests = [];
    for (const url of urls) {
      //console.log('url append');

      let req = this.http.get(AppConfigs.api_base_url + url);
      requests.push(req);
    }
    //console.log(requests)
    this.validateApiToken().then(response => {
      Observable.forkJoin(requests).subscribe(response => {
        successCallback(response);
      })
    }).catch(error => {

    })

  }


} 
