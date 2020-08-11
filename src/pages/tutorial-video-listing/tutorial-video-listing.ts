import { PlayVideoComponent } from './../../components/play-video/play-video';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { LocalStorageProvider } from '../../providers/local-storage/local-storage';
import { storageKeys } from '../../providers/storageKeys';
import { ApiProvider } from '../../providers/api/api';
import { AppConfigs } from '../../providers/appConfig';


@Component({
  selector: 'page-tutorial-video-listing',
  templateUrl: 'tutorial-video-listing.html',
})
export class TutorialVideoListingPage {
  
  videoList:any[]
  constructor(
    private localStorage: LocalStorageProvider,
    private apiService: ApiProvider,
    private navCtrl:NavController


  ){}

  ionViewDidLoad(){
    this.localStorage.getLocalStorage(storageKeys.staticLinks).then(success => {
      this.videoList=success['tutorial-video'].metaInformation.videos
    }).catch(error => {
    })
  }
 

  playVideo(link){
    // this.youtube.openVideo('ovqDe_G7ct8');
    // window.open(link,"_system")
    // this.navCtrl.push(PlayVideoComponent, { videoLink: link })
    const videoId=link.substr(link.lastIndexOf('/'))
    const finalLink=`https://www.youtube.com/embed${videoId}`
    this.navCtrl.push(PlayVideoComponent, { videoLink: finalLink,orientation:'landscape' })


  }
 
 
  

}
