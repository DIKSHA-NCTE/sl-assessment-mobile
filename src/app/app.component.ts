import { Component, ViewChild } from '@angular/core';
import { Platform, AlertController, Nav, App, MenuController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

// import { TabsPage } from '../pages/tabs/tabs';
import { CurrentUserProvider } from '../providers/current-user/current-user';
import { WelcomePage } from '../pages/welcome/welcome';
import { TranslateService } from '@ngx-translate/core';
import { Network } from '@ionic-native/network';
import { NetworkGpsProvider } from '../providers/network-gps/network-gps';
import { HomePage } from '../pages/home/home';
<<<<<<< HEAD
import { AppConfigs } from '../providers/appConfig';
import { SchoolListPage } from '../pages/school-list/school-list';
import { FaqPage } from '../pages/faq/faq';
import { AboutPage } from '../pages/about/about';
=======
>>>>>>> Menu added

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  rootPage: any;
  isAlertPresent: boolean = false;
  networkSubscription: any;
  networkAvailable: boolean;
  appName: string = AppConfigs.appName;
  // rootPage: any = "LoginPage";
  allPages: Array<Object> =  [
    {
      name: "home",
      icon:"home",
      component: HomePage,
      active: true
    },
    {
      name: "mySchool",
      icon:"book",
      component: SchoolListPage,
      active: false
    },
    {
      name: "faqs",
      icon: "help",
      component: FaqPage,
      active: false
    },
    {
      name: "about",
      icon: "information-circle",
      component: AboutPage,
      active: false
    }
  ]

  currentPage;
  constructor(
    private platform: Platform,
    private statusBar: StatusBar,
    private splashScreen: SplashScreen,
    private currentUser: CurrentUserProvider,
    private alertCtrl: AlertController,
    private translate: TranslateService,
    private network: Network,
    private networkGpsProvider: NetworkGpsProvider,
    private menuCntrl: MenuController
  ) {
    platform.ready().then(() => {
      // this.currentPage = this.nav.getActive();
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.initilaizeApp();
      this.networkGpsProvider.initializeNetworkEvents();
      this.registerBAckButtonAction();
      this.initTranslate();
      // this.networkListenerInitialize();
      // Offline event
      // this.events.subscribe('network:offline', () => {
      //   alert('network:offline ==> ' + this.network.type);
      // });

      // // Online event
      // this.events.subscribe('network:online', () => {
      //   alert('network:online ==> ' + this.network.type);
      // });
    });

  }

  ionViewWillLeave() {
    if (this.networkSubscription) {
      this.networkSubscription.unsubscribe();
    }
  }

  goToPage(index) {
    this.menuCntrl.close();
    for (const page of this.allPages) {
      page['active'] = false;
    }
    this.allPages[index]['active'] = true;
    this.nav.setRoot(this.allPages[index]['component']);
  }

  initTranslate() {
    this.translate.setDefaultLang('en');
  }

  networkListenerInitialize(): void {
    console.log("network listener")

    console.log("Network type " + this.network.type)
    this.networkSubscription = this.network.onDisconnect().subscribe(() => {
      this.networkAvailable = false;
      this.networkGpsProvider.setNetworkStatus(this.networkAvailable);
    });

    let connectSubscription = this.network.onConnect().subscribe(() => {
      this.networkAvailable = true;
      this.networkGpsProvider.setNetworkStatus(this.networkAvailable);
    });

    this.networkSubscription.add(connectSubscription);

    this.networkAvailable = this.network.type !== 'none' ? true : false;
    this.networkGpsProvider.setNetworkStatus(this.networkAvailable);
  }

  initilaizeApp(): void {
    this.statusBar.styleDefault();
    this.statusBar.overlaysWebView(false);

    // this.statusBar.backgroundColorByName(black)
    this.currentUser.checkForTokens().then(response => {
      console.log("Deiactivated " + response.isDeactivated)
      this.rootPage = WelcomePage;

      if (response.isDeactivated) {
        this.rootPage = WelcomePage;
        this.splashScreen.hide()
      } else {
        this.rootPage = HomePage;
        // this.splashScreen.hide()
        // this.statusBar.overlaysWebView(false);
      }

    }).catch(error => {
      this.rootPage = WelcomePage;
      // this.splashScreen.hide()
      // this.statusBar.overlaysWebView(false);

    })
    // this.statusBar.hide();
    // this.statusBar.overlaysWebView(false);

  }

  registerBAckButtonAction(): void {
    this.platform.registerBackButtonAction(() => {
      let alert;
      // this.nav.indexOf('WelcomePage')
      // console.log("hiii "+ JSON.stringify(this.nav.getByIndex(0)))
      if (this.nav.length() > 1) {
        this.nav.pop();
      } else {
        if (!this.isAlertPresent) {
          this.isAlertPresent = true;
          alert = this.alertCtrl.create({
            title: 'App termination',
            message: 'Do you want to close the app?',
            enableBackdropDismiss: false,
            buttons: [{
              text: 'Cancel',
              role: 'cancel',
              handler: () => {
                console.log('Application exit prevented!');
                this.isAlertPresent = false;
              }
            }, {
              text: 'Close App',
              handler: () => {
                this.platform.exitApp(); // Close this application
              }
            }]
          });
          alert.present()
        }
      }
    })
  }

}
