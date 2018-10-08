import { Component } from '@angular/core';
import { NavController, NavParams, App } from 'ionic-angular';
import { UtilsProvider } from '../../providers/utils/utils';
import { Storage } from '@ionic/storage';
import { File } from '@ionic-native/file';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { ApiProvider } from '../../providers/api/api';
import { AppConfigs } from '../../providers/appConfig';

declare var cordova: any;

@Component({
  selector: 'page-image-listing',
  templateUrl: 'image-listing.html',
})
export class ImageListingPage {

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private storage: Storage, private file: File, private fileTransfer: FileTransfer,
    private apiService: ApiProvider, private utils: UtilsProvider,
    private app: App) {
  }

  uploadImages: any;
  imageList = [];
  appFolderPath: string = cordova.file.externalDataDirectory + 'images';
  schoolId: any;
  schoolName: string
  selectedEvidenceIndex: any;
  currentEvidenceId: any;
  uploadIndex: number = 0;
  schoolData: any;
  currentEvidence: any;
  evidenceSections: any;
  selectedEvidenceName: any;

  ionViewDidLoad() {
    this.schoolId = this.navParams.get('_id');
    this.schoolName = this.navParams.get('name');
    this.selectedEvidenceIndex = this.navParams.get('selectedEvidence');
    this.currentEvidenceId = this.navParams.get('selectedEvidenceId');
    
    this.storage.get('schoolsDetails').then(data => {
      this.schoolData = JSON.parse(data);
      this.currentEvidence = this.schoolData[this.schoolId]['assessments'][0]['evidences'][this.selectedEvidenceIndex];
      this.evidenceSections = this.schoolData[this.schoolId]['assessments'][0]['evidences'][this.selectedEvidenceIndex]['sections'];
      this.selectedEvidenceName = this.schoolData[this.schoolId]['assessments'][0]['evidences'][this.selectedEvidenceIndex]['name'];
      // this.checkForEvidenceCompletion();
      // this.submitEvidence()
    }).catch(error => {

    })
    this.storage.get('images').then(data => {
      console.log(data)
      this.uploadImages = JSON.parse(data) ? JSON.parse(data)[this.currentEvidenceId] : [];
      console.log(this.uploadImages)
      if (this.uploadImages.length) {
        this.createImageFromName(this.uploadImages);
      } else {
        console.log('Evidence submit');
        this.submitEvidence();
      }
    })

  }

  getImageUploadUrls() {
    const files = {
      "files": []
    }
    for (const image of this.uploadImages) {
      files.files.push(image.name)
    }
    console.log(JSON.stringify(files))
    this.apiService.httpPost(AppConfigs.survey.getImageUploadUr, files, success => {
      console.log(JSON.stringify(success));
      for (let i = 0; i < success.result.length; i++) {
        this.imageList[i]['url'] = success.result[i].url;
      }
      this.utils.stopLoader();
      this.cloudImageUpload();
      this.fileTransfer.create()
    }, error => {
      this.utils.stopLoader();
    })
  }

  createImageFromName(imageList) {
    this.utils.startLoader();
    for (const image of imageList) {
      // console.log(image.name)
      this.file.checkFile(this.appFolderPath + '/', image.name).then(response => {
        // console.log('Check For file name : ' + response);
        this.file.readAsDataURL(this.appFolderPath, image.name).then(data => {
          console.log("Done");
          this.imageList.push({ data: data, uploaded: false, file: image.name, url: "" });
          console.log(this.imageList.length);
        }).catch(err => {
          console.log('Error ' + JSON.stringify(err))
        })
      }).catch(error => {
        console.log('Error ' + JSON.stringify(error))
      })
    }
    console.log('Otside')
    this.getImageUploadUrls();
  }


  cloudImageUpload() {
    console.log(this.uploadIndex)
    var options: FileUploadOptions = {
      fileKey: this.imageList[this.uploadIndex].file,
      fileName: this.imageList[this.uploadIndex].file,
      chunkedMode: false,
      mimeType: "image/jpeg",
      // params: { 'fileName': image.file },
      headers: {
        "Content-Type": 'multipart/form-data'
      },
      httpMethod: 'PUT',
    };
    let targetPath = this.pathForImage(this.imageList[this.uploadIndex].file);
    // console.log(JSON.stringify(this.file.resolveLocalFilesystemUrl(cordova.file.externalDataDirectory + 'Samiksha/'+image.file)));
    let fileTrns: FileTransferObject = this.fileTransfer.create();
    fileTrns.upload(targetPath, this.imageList[this.uploadIndex].url, options).then(result => {
      console.log(JSON.stringify(result));
      console.log("Uploaded image" + this.uploadIndex);
      // this.uploaded = "File uploaded";
      this.imageList[this.uploadIndex].uploaded = true;
      if (this.uploadIndex < (this.imageList.length - 1)) {
        this.uploadIndex++;
        this.cloudImageUpload();
      } else {
        this.submitEvidence();
      }
    }).catch(err => {
      console.log(JSON.stringify(err))
    })
  }

  pathForImage(img) {
    if (img === null) {
      return '';
    } else {
      return cordova.file.externalDataDirectory + 'images/' + img;
    }
  }


  submitEvidence() {
    // this.utils.startLoader();
    this.utils.startLoader('Please wait while submitting ...')
    const payload = this.constructPayload();
    console.log(JSON.stringify(payload));

    const submissionId = this.schoolData[this.schoolId]['assessments'][0].submissionId;
    const url = AppConfigs.survey.submission + submissionId;
    this.apiService.httpPost(url, payload, response => {
      this.utils.openToast(response.message);
      this.schoolData[this.schoolId]['assessments'][0]['evidences'][this.selectedEvidenceIndex].isSubmitted = true;
      this.utils.setLocalSchoolData(this.schoolData);
      // this.navCtrl.setRoot('EvidenceListPage');
      // this.navCtrl.popToRoot();
      this.utils.stopLoader()
      const options = {
        _id: this.schoolId,
        name: this.schoolName
      }
      // this.app.push('EvidenceListPage', options);
      this.utils.stopLoader();
      this.navCtrl.popTo('EvidenceListPage');
      // this.navCtrl.popToRoot()

      // console.log(JSON.stringify(response))
    }, error => {
      this.utils.stopLoader();
      // console.log(JSON.stringify(error))
    })
    // console.log(JSON.stringify(this.constructPayload()));

  }

  constructPayload() {
    console.log("in construct")
    const payload = {
      'schoolProfile': {},
      'evidence': {}
    }
    const schoolProfile = {};
    const evidence = {
      id: "",
      externalId: "",
      answers: []
    };
    for (const field of this.schoolData[this.schoolId]['schoolProfile']['form']) {
      schoolProfile[field.field] = field.value
    }
    // schoolProfile['updatedBy'] =  this.userData.sub;
    schoolProfile['updatedDate'] = Date.now();

    evidence.id = this.schoolData[this.schoolId]['assessments'][0]['evidences'][this.selectedEvidenceIndex]._id;
    evidence.externalId = this.schoolData[this.schoolId]['assessments'][0]['evidences'][this.selectedEvidenceIndex].externalId;

    for (const section of this.evidenceSections) {
      for (const question of section.questions) {
        const obj = {
          qid: question._id,
          value: question.value,
          remarks: question.remarks,
          fileName: question.fileName
        };
        evidence.answers.push(obj);
      }
    }
    payload.schoolProfile = schoolProfile;
    payload.evidence = evidence;
    return payload
  }

}