import { Component, OnDestroy } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';
import { ScreenOrientation } from '@ionic-native/screen-orientation/';


/**
 * Generated class for the PlayVideoComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'play-video',
  templateUrl: 'play-video.html'
})
export class PlayVideoComponent implements OnDestroy {

  link: any;
  orientation: any;

  constructor(private navParams: NavParams, private sanitizer: DomSanitizer,private screenOrientation:ScreenOrientation) {}
  ionViewDidLoad() {
    this.link = this.navParams.get('videoLink')
    this.orientation = this.navParams.get('orientation')
    if(this.orientation)this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
  }

  sanitizeUrl() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.link);
  }

  ngOnDestroy(){
    this.screenOrientation.unlock()
  }

}
