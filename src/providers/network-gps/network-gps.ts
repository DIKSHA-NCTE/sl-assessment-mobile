import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Geolocation } from '@ionic-native/geolocation';
import { UtilsProvider } from '../utils/utils';
import { Subject } from 'rxjs/Subject';
import { Network } from '@ionic-native/network';
import { Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import { SlackProvider } from '../slack/slack';
import { AppConfigs } from '../appConfig';

export enum ConnectionStatusEnum {
  Online,
  Offline
}

@Injectable()
export class NetworkGpsProvider {

  networkStatus$ = new Subject();
  networkStatus: boolean;
  previousStatus: any;
  gpsLocation: string;
  errorObj = {
    "fallback": "User Details",
    "title": `GPS Error Details`,
    "text": ``
  }
  constructor(
    public http: HttpClient,
    private permissions: AndroidPermissions,
    private locationAccuracy: LocationAccuracy,
    private geolocation: Geolocation,
    private utils: UtilsProvider,
    private network: Network,
    private translate: TranslateService,
    private slackService: SlackProvider,
    private eventCtrl: Events, private storage: Storage) {
    console.log('Hello NetworkGpsProvider Provider');
    this.previousStatus = ConnectionStatusEnum.Online;
  }

  getNetowrkDetails() {
    const network = { type: this.network.type, downMax: this.network.downlinkMax };
    return network
  }

  checkForLocationPermissions(): void {
    if (!AppConfigs.enableGps) {
      return
    }

    console.log('Check permissions');
    this.permissions.checkPermission(this.permissions.PERMISSION.ACCESS_FINE_LOCATION).then(
      result => {
        console.log('Has permission?', result.hasPermission)
        if (!result.hasPermission) {
          console.log("ask permission");
          this.permissions.requestPermission(this.permissions.PERMISSION.ACCESS_FINE_LOCATION).then(result => {
            if (result.hasPermission) {
              this.enableGPSRequest();
            }
          }).catch(error => {
            console.log('error')
          })
        } else {
          console.log('yes, Has permission');
          // this.isLocationEnabled();
          this.enableGPSRequest();
        }
      }).catch(error => {
      });
  }

  getGpsStatus() {
    return new Promise((resolve, reject) => {
      if (!AppConfigs.enableGps) {
        resolve(null)
        return
      }
      this.locationAccuracy.canRequest().then((canRequest: boolean) => {
        if (canRequest) {
          // the accuracy option will be ignored by iOS
          this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(() => {
            const options = {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 30000
            }
            this.geolocation.getCurrentPosition(options).then((resp) => {
              const location = `${resp.coords.latitude},${resp.coords.longitude}`;
              // this.utils.openToast(location)
              resolve(location)
            }).catch((error) => {
              // this.translate.get(['toastMessage.unableToFetchGps']).subscribe(translations => {
              //   this.utils.openToast(translations.unableToFetchGps);
              // });
              this.errorObj.text = `getCurrentPosition error. ${JSON.stringify(error)}`;
              this.translate.get(['toastMessage.reEnableGPS']).subscribe(translations => {
                this.utils.openToast(translations['toastMessage.reEnableGPS']);
              })
              this.slackService.pushException(this.errorObj);
              // this.getGpsStatus();
              // this.utils.openToast("Something went wrnog. Please try again.")
              reject()
            });
          }, error => {
            this.translate.get(['toastMessage.enableGPS']).subscribe(translations => {
              this.utils.openToast(translations['toastMessage.enableGPS']);
            })
            console.log("GPS on permission denied");
            reject()

          });
        } else {
          console.log("hiiiiiii")
          this.permissions.requestPermission(this.permissions.PERMISSION.ACCESS_FINE_LOCATION).then(result => {
            console.log("permission");
            console.log(JSON.stringify(result))
            if (result.hasPermission) {
              this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(() => {
                const options = {
                  enableHighAccuracy: true,
                  timeout: 20000,
                  maximumAge: 300000
                }
                this.geolocation.getCurrentPosition(options).then((resp) => {
                  const location = `${resp.coords.latitude},${resp.coords.longitude}`;
                  // this.utils.openToast(location)
                  resolve(location)
                }).catch((error) => {
                  // this.utils.openToast("Please enable location permission to continue.")
                  this.translate.get(['toastMessage.unableToFetchGps']).subscribe(translations => {
                    this.utils.openToast(translations.unableToFetchGps);
                  });
                  this.errorObj.text = `getCurrentPosition error. ${JSON.stringify(error)}`;
                  this.slackService.pushException(this.errorObj);
                  reject()
                });
              }, error => {
                this.translate.get(['toastMessage.enableGPS']).subscribe(translations => {
                  this.utils.openToast(translations['toastMessage.enableGPS']);
                })
                this.errorObj.text = `locationAccuracy.request error. ${JSON.stringify(error)}`;
                this.slackService.pushException(this.errorObj);
                console.log("GPS on permission denieddddd");
                reject()

              });
            } else {
              console.log("errrrrrrrrr")
              this.utils.openToast("Please enable location permission to continue.")
              reject();
            }
          }).catch(error => {
            console.log('error');
            this.utils.openToast("Please grand permission for location.")
            reject();

          })
        }
      });
    })
  }


  enableGPSRequest() {
    this.locationAccuracy.canRequest().then((canRequest: boolean) => {
      if (canRequest) {
        // the accuracy option will be ignored by iOS
        this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(() => {
          this.getCurrentLocation();
        }
        ).catch(errror => {

        });
      } else {
        //For ios devices
        this.getCurrentLocation();

      }

    });
  }

  getCurrentLocation() {
     if (!AppConfigs.enableGps) {
       return;
     }
    console.log("Getting current location");
    const options = {
      timeout: 20000
    }
    // return new Promise(resolve => {
    this.geolocation.getCurrentPosition(options).then((resp) => {
      this.gpsLocation = resp.coords.latitude + "," + resp.coords.longitude;
      this.storage.set('gpsLocation', this.gpsLocation)
      // this.utils.openToast(resp.coords.latitude + " " + resp.coords.longitude);
      console.log(resp.coords.latitude + " " + resp.coords.longitude)
      // return gpsLocation
    }).catch((error) => {
      // this.utils.openToast('Error getting location' + JSON.stringify(error));
      console.log(error.message + " " + error.code);

      this.storage.get('gpsLocation').then(success => {
        this.gpsLocation = success
        // resolve(success);
      }).catch(error => {

      })
    });
    // })

  }

  getGpsLocation(): string {
    this.getCurrentLocation();
    return this.gpsLocation
  }

  setNetworkStatus(status): void {
    console.log("NEtwork status" + status);
    this.networkStatus = status;
    this.networkStatus$.next(status);
  }

  getNetworkStatus(): boolean {
    return this.networkStatus
  }

  public initializeNetworkEvents(): void {
    this.network.onDisconnect().subscribe(() => {
      if (this.previousStatus === ConnectionStatusEnum.Online) {
        this.eventCtrl.publish('network:offline');
      }
      this.previousStatus = ConnectionStatusEnum.Offline;
      this.networkStatus = false;
    });
    this.network.onConnect().subscribe(() => {
      if (this.previousStatus === ConnectionStatusEnum.Offline) {
        this.eventCtrl.publish('network:online');
      }
      this.previousStatus = ConnectionStatusEnum.Online;
      this.networkStatus = true;
    });

    if (this.network.type !== 'none') {
      this.networkStatus = true;
    } else {
      this.networkStatus = false;
    }

  }


}
