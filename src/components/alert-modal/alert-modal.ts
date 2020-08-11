import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Market } from '@ionic-native/market';
import { AppVersion } from '@ionic-native/app-version';
import { LocalStorageProvider } from '../../providers/local-storage/local-storage';

@Component({
  selector: 'alert-modal',
  templateUrl: 'alert-modal.html'
})
export class AlertModalComponent implements OnInit {

  @Input() notificationMeta;
  @Output() closeModal = new EventEmitter();
  currentAppVersionObj;
  releaseNote = [];

  constructor(
    private market: Market,
    private appVersion: AppVersion,
    private localStorage: LocalStorageProvider) {
    this.localStorage.getLocalStorage('appUpdateVersions').then(obj => {
      this.currentAppVersionObj = obj;
    }).catch(error => {
      this.currentAppVersionObj = {};
    })
  }

  ngOnInit() {
    this.createReleaseNote();
  }

  createReleaseNote() {
    if (this.notificationMeta.payload && this.notificationMeta.payload.releaseNotes) {
      this.releaseNote = this.notificationMeta.payload.releaseNotes.includes('.') ?
        this.notificationMeta.payload.releaseNotes.split('.') :
        [this.notificationMeta.payload.releaseNotes]
    }

  }

  openAppStore() {
    this.appVersion.getPackageName().then(success => {
      this.currentAppVersionObj[this.notificationMeta.payload.appVersion] = 'accepted';
      this.localStorage.setLocalStorage('appUpdateVersions', this.currentAppVersionObj);
      this.market.open(success);
      this.closeModal.emit();
    })
  }



  close() {
    this.closeModal.emit();
    this.currentAppVersionObj[this.notificationMeta.payload.appVersion] = 'rejected';
    this.localStorage.setLocalStorage('appUpdateVersions', this.currentAppVersionObj);
  }


}
