import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { FeedbackProvider } from '../../providers/feedback/feedback';
import { DetailPage } from '../detail/detail';
import { Device } from '@ionic-native/device';
import { AppConfigs } from '../../providers/appConfig';
import { CurrentUserProvider } from '../../providers/current-user/current-user';
import { Network } from '@ionic-native/network';
import { UtilsProvider } from '../../providers/utils/utils';
import { LocalStorageProvider } from '../../providers/local-storage/local-storage';


@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  languageChange: string = 'en';
  isIos: boolean;
  networkDetails;
  staticLinks = [];
  aboutContent = [];



  constructor(public navCtrl: NavController,
    private translate: TranslateService, private utils: UtilsProvider,
    private feedbackService: FeedbackProvider, private device: Device,
    private platform: Platform, private currentUSer: CurrentUserProvider,
    private localStorage: LocalStorageProvider,
    private network: Network) {
    this.isIos = this.platform.is('ios') ? true : false;
    this.localStorage.getLocalStorage('staticLinks').then(data => {
      
      for (const link in data) {
        if(data[link].link != ''){
          const obj = {
            heading:data[link].title,
            link:data[link].link
          };
          this.staticLinks.push(obj);
          this.setMenuItems();
        }
        
      }
    }).catch(error => {

    })
  }

  setMenuItems() {
    this.aboutContent = [
      //   {
      //   heading: "Message from Dy CM",
      //   content: `<p>Three and a half years ago, I began with a dream, simple but overwhelming. A dream to build our nation on strong democratic values. But this is only possible when we have schools that are joyful, inclusive and learning spaces. Today, that dream looks like a possibility.</p> <p> Samiksha  is an effort to understand our schools better, to celebrate the strengths and to commit to working on the weakness. It is here that I see your role as crucial. Your honest, objective and credible evaluation will guide us to prepare improvement plan that enables our schools, and changes our children’s lives.</p>
      //   <p>My dear friends, I am very appreciative of your commitment for this work, and assure you that my government will do all that it takes to make our nation something to be truly proud of.</p>
      //   <p>Let’s build our nation together. I and You, together.</p>
      //   <br>
      //   <p><b>Manish Sisodia</b></p>`,
      //   images:[
      //     {path:"assets/imgs/gnctd.png" , title: "", position: "top"},
      //     {path:"assets/imgs/Manish_Sisodia.jpg", title:"Manish Sisodia", position: "bottom"}, 
      //   ]
  
      // },{
      //   heading: "DCPCR: In Brief",
      //   content: `<p>Delhi Commission for Protection of Child Rights (DCPCR) is a statutory body responsible for ensuring that there is no violation of Child Rights in National Capital Territory (NCT) of Delhi. Monitoring fair implementation of Right To Education (RTE) Act 2009 is one of its key responsibilities. </p>
      //   <p>Signficant responsibilities also include the following:<div><ul>
      //   <li>To suggest legal safeguards for protection of children and suggest measures</li>
      //   <li>Enquire cases of child rights violation</li>
      //   <li>To spread awareness about Child Rights and related issues</li>
      //   </ul</div><p>`,
      //   images: [
      //     {path:"assets/imgs/DCPCR_logo.jpg", title: "", position: "top"}
      //   ]
      // }, {
      //   heading: "About Samiksha",
      //   content: `<p> Samiksha  is envisaged as a method to improve the quality of learning in schools of Delhi. A comprehensive school evaluation across the themes of ‘Safety & Security’, ‘Teaching and Learning’, and ‘Social Inclusion and Community Participation’ is being conducted to achieve the vision of Samiksha.</p>
      //   <p>The data collected will help us in the following ways-
      //   <ul>
      //   <li>The parents can make informed decisions</li>
      //   <li>The government will be able to identify trends and deficiencies</li>
      //   <li>To celebrate good practices</li>
      //   </ul>
      //   </p>
      //   <p>The team of assessors will go to each school and collect data. It will be compiled, analysed and presented for all to access.</p>
      //   <p>This is its first exercise and will be an annual exercise going forward to continuously improve schools.</p>
      //   <p>Let’s celebrate this step towards building a better future for our children.</p>
      //   <p>This app is based on the tool developed by Adhyayan Foundation in collaboration with Teach For India.</p>`,
      //   images: [
      //     {path:"assets/imgs/ShikshaLokamLogo.jpg", position:"top"}
      //   ]
      // },
      // {
      //   heading: "Partners",
      //   images: [
      //     {path: "assets/imgs/EDMC_Logo.jpg"},
      //     {path:"assets/imgs/New_Delhi_Municipal_Council_logo.jpg"},
      //     {path:"assets/imgs/NDMCLogo.jpg"},
      //     {path:"assets/imgs/DCB_Logo.jpg"},
      //     {path:"assets/imgs/SDMC_Logo.jpg"},
      //     {path:"assets/imgs/CSFLogo.png"},
      //     {path:"assets/imgs/TFIlogo.png"},
      //     {path:"assets/imgs/AdhyayanLogo.png"},
      //     {path:"assets/imgs/Mantra_Logo.png"},
      //     {path:"assets/imgs/ShikshaLokamLogo.png"},
      //     {path:"assets/imgs/QCILogo.jpg"},
      //     {path:"assets/imgs/PrathamLogo.png"},
      //   ]
      // }, 
      {
        heading: "App Info",
        showEraseBtn: true,
        content: `
      <p>App version ${AppConfigs.appVersion}</p>
      <p>Make/Model:  ${this.device.manufacturer}/ ${this.device.model}</p>
      <p>OS version: ${this.device.platform} ${this.device.version}</p>
      <p>Name: ${this.currentUSer.getCurrentUserData().name}</p>
      <p>Email: ${this.currentUSer.getCurrentUserData().email}
      <p>User Id : ${this.currentUSer.getCurrentUserData().preferred_username}
      <p>Network type: ${this.network.type}</p>`,
        images: [
          { path: "assets/imgs/just-logo1.png", position: "top" }
        ],
        link: null
      },
      // {
      //   heading: "Terms of use",
      //   link: AppConfigs.externalLinks.termsOfUse
      // },
      // {
      //   heading: "Privacy Policy",
      //   link: AppConfigs.externalLinks.privacyPolicy
      // }
      ...this.staticLinks
    ]
    
  }

  changeLanguage(val): void {
    this.translate.use(this.languageChange)
  }

  feedback(): void {
    this.feedbackService.sendFeedback();
  }

  ionViewDidLoad() {
  }

  goTodetailsPage(i) {
    if (this.aboutContent[i].link) {
      this.utils.openExternalLinkOnBrowser(this.aboutContent[i].link);
    } else {
      this.navCtrl.push(DetailPage, { content: this.aboutContent[i], header: 'headings.about' });
    }
  }

}
