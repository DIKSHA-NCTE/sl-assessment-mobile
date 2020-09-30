import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Slides, Events } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Network } from '@ionic-native/network';
import { NetworkGpsProvider } from '../../providers/network-gps/network-gps';
import { AppConfigs } from '../../providers/appConfig';

@Component({
  selector: 'page-welcome',
  templateUrl: 'welcome.html',
})
export class WelcomePage {

  @ViewChild(Slides) slides: Slides;

  skipMsg: string;
  activeSlide = 0;
  slidesList = [
    {
      // title: "Slide 1",
      image: "assets/imgs/just-logo.png"
    },
    // { title: "Slide 2" },
    // { title: "Slide 3" }
  ];
  responseData: any;
  token: any;
  networkAvailable: boolean;
  subscription: any;
  appVersion = AppConfigs.appVersion;

  constructor(public navCtrl: NavController, public navParams: NavParams, public storage: Storage,
    private auth: AuthProvider,
    private events: Events,
    private toastCtrl: ToastController, private network: Network, private netwrkGpsProvider: NetworkGpsProvider) {
    this.subscription = this.network.onDisconnect().subscribe(() => {
      // this.presentToast('Network was disconnected :-(');
      this.networkAvailable = false
    });

    let connectSubscription = this.network.onConnect().subscribe(() => {
      this.networkAvailable = true;
      // this.presentToast('Network is connected :-(');

      // We just got a connection but we need to wait briefly
      // before we determine the connection type. Might need to wait.
      // prior to doing any api requests as well.

    });
    this.subscription.add(connectSubscription);
  }

  ionViewWillLeave() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'bottom'
    });

    toast.onDidDismiss(() => {});
    toast.present();
  }

  signIn() {


    this.auth.doOAuthStepOne().then(code => {
      this.responseData = JSON.stringify(code);
      this.auth.doOAuthStepTwo(code).then(success => {
        this.auth.checkForCurrentUserLocalData(success);
      }).catch(error => {})
    }).then(response => {
    })
  }

  ionViewDidLoad() {
    this.events.publish('loginSuccess', true);
    this.skipMsg = "Skip";
    console.log('ionViewDidLoad WelcomePage');
    this.netwrkGpsProvider.checkForLocationPermissions();
    // this.checkForLocationPermissions();
    // this.gelLoc();

    if (this.network.type != 'none') {
      this.networkAvailable = true;
    }
  }

  slideChanged(): void {
    this.activeSlide = this.slides.getActiveIndex();
  }

  gotToLastSlide() {
    this.slides.slideNext();
    this.slides.slideNext();

  }

  gotToNextSlide() {
    this.slides.slideTo(2);
  }

}
