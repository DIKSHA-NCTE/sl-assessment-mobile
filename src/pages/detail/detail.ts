import { Component } from '@angular/core';
import { NavController, NavParams, App, AlertController } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { WelcomePage } from '../welcome/welcome';
import { CurrentUserProvider } from '../../providers/current-user/current-user';
import { AuthProvider } from '../../providers/auth/auth';
import { LocalStorageProvider } from '../../providers/local-storage/local-storage';
import { UtilsProvider } from '../../providers/utils/utils';
import { ApiProvider } from '../../providers/api/api';
import { AppConfigs } from '../../providers/appConfig';
import { TranslateService } from '@ngx-translate/core';
import { NotificationProvider } from '../../providers/notification/notification';

@Component({
  selector: 'page-detail',
  templateUrl: 'detail.html',
})
export class DetailPage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private iab: InAppBrowser,
    private app: App,
    private translate : TranslateService,
    private alertctrl: AlertController,
    private currentUser: CurrentUserProvider,
    private auth: AuthProvider,
    private localStorage: LocalStorageProvider,
    private notifictnProvider: NotificationProvider,
    private apiService: ApiProvider,
    private utils: UtilsProvider) {
  }

  content: any;
  header: any;

  ionViewDidLoad() {
    console.log('ionViewDidLoad DetailPage');
    this.content = this.navParams.get('content');
    this.header = this.navParams.get("header");
  }

  openUrl(url) {
    const browser = this.iab.create(url);
    browser.show();
  }

  clearData() {
    let translateObject ;
          this.translate.get(['actionSheet.warning','actionSheet.schoolSurveyEarse','actionSheet.no','actionSheet.yes']).subscribe(translations =>{
            translateObject = translations;
            console.log(JSON.stringify(translations))
          })
    let alert = this.alertctrl.create({
      title: translateObject['actionSheet.warning'],
      subTitle: translateObject['actionSheet.schoolSurveyEarse'],
      buttons: [
        {
          text:  translateObject['actionSheet.no'],
          role: 'role',
          handler: data => {

          }
        },
        {
          text:  translateObject['actionSheet.yes'],
          role: 'role',
          handler: data => {
            this.utils.startLoader()
            this.localStorage.deleteAllStorage().then(success => {
              this.auth.doLogout().then(success => {
                this.utils.stopLoader();
                this.currentUser.removeUser().then(success => {
                  let nav = this.app.getRootNav();
                  this.notifictnProvider.stopNotificationPooling();
                  nav.setRoot(WelcomePage);
                })
              }).catch(error => {
                this.utils.stopLoader();

              })
            }).catch(error => {
              this.utils.stopLoader();
            })
          }
        }
      ],
      enableBackdropDismiss: false
    });
    alert.present();
    
  }

  openAlert() {
    let translateObject ;
    this.translate.get(['actionSheet.pleaseEnterPasscode','actionSheet.passcode','actionSheet.cancel','actionSheet.submit']).subscribe(translations =>{
      translateObject = translations;
      console.log(JSON.stringify(translations))
    })
    const alert = this.alertctrl.create({
      title: translateObject['actionSheet.pleaseEnterPasscode'],
      inputs: [
        {
          name: translateObject['actionSheet.passcode'],
          placeholder: translateObject['actionSheet.passcode']
        },
      ],
      buttons: [
        {
          text: translateObject['actionSheet.cancel'],
          handler: data => {
          }
        },
        {
          text: translateObject['actionSheet.submit'],
          handler: data => {
            this.getAccessTokenForAction(data)
          }
        }
      ]
    });
    alert.present();
  }

  getAccessTokenForAction(passcode) {
    // const payload = {
    //   "passcode": passcode
    // }
    this.utils.startLoader();
    this.apiService.httpPost(AppConfigs.help.getHelpToken, passcode, successData => {
      this.utils.ActionEnableSubmit(successData.result);
      this.utils.stopLoader();
    }, error => {
      this.utils.stopLoader();
      this.utils.openToast(error.result.message);

    })
  }

}
