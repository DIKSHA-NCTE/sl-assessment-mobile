import { Component, OnInit, Input } from "@angular/core";
import {
  ActionSheetController,
  Platform,
  AlertController,
} from "ionic-angular";
import { Camera, CameraOptions } from "@ionic-native/camera";
import { File } from "@ionic-native/file";
import { ImagePicker, ImagePickerOptions } from "@ionic-native/image-picker";
import { UtilsProvider } from "../../providers/utils/utils";
import { Storage } from "@ionic/storage";
import { PhotoLibrary } from "@ionic-native/photo-library";
import { TranslateService } from "@ngx-translate/core";
import { FileChooser } from "@ionic-native/file-chooser";
import { FilePath } from "@ionic-native/file-path";
import { IOSFilePicker } from "@ionic-native/file-picker";
import { FILE_EXTENSION_HEADERS } from "./mimTypes";
import { FileOpener } from "@ionic-native/file-opener";
import { MediaObject, Media } from "@ionic-native/media";
import { LocalStorageProvider } from "../../providers/local-storage/local-storage";
import { AndroidPermissions } from "@ionic-native/android-permissions";
import { Diagnostic } from "@ionic-native/diagnostic";

declare var cordova: any;

@Component({
  selector: "image-upload",
  templateUrl: "image-upload.html",
})
export class ImageUploadComponent implements OnInit {
  recording: boolean = false;
  filesPath: string;
  fileName: string;
  audio: MediaObject;
  audioList: any[] = [];
  isIos: boolean = this.platform.is("ios");
  interval;
  timeLeft: number = 0;
  minutes: number = 0;
  seconds: number = 0;

  text: string;
  datas;
  appFolderPath: string;
  videoFormats = ["mp4", "WMV", "WEBM", "flv", "avi", "3GP", "OGG"];
  audioFormats = ["AIF", "cda", "mpa", "ogg", "wav", "wma", "mp3"];
  pptFormats = ["ppt", "pptx", "pps", "ppsx"];
  wordFormats = ["docx", "doc", "docm", "dotx"];
  imageFormats = ["jpg", "png", "jpeg"];
  pdfFormats = ["pdf"];
  spreadSheetFormats = ["xls", "xlsx"];

  @Input()
  set data(data) {
    this.datas = data;
    this.createImageFromName(data["fileName"]);
  }

  get name() {
    return true;
  }
  @Input() evidenceId: any;
  @Input() schoolId: string;
  @Input() submissionId: any;
  @Input() imageLocalCopyId: string;
  @Input() generalQuestion: boolean;

  imageList: Array<any> = [];
  imageNameCounter: number = 0;
  localEvidenceImageList: any;
  // allLocalImageList: any = {};

  constructor(
    private actionSheet: ActionSheetController,
    private camera: Camera,
    private localStorage: LocalStorageProvider,
    private file: File,
    private imgPicker: ImagePicker,
    private utils: UtilsProvider,
    private storage: Storage,
    private photoLibrary: PhotoLibrary,
    private platform: Platform,
    private translate: TranslateService,
    private filePath: FilePath,
    private iosFilePicker: IOSFilePicker,
    private fileOpener: FileOpener,
    private fileChooser: FileChooser,
    private androidPermissions: AndroidPermissions,
    private diagnostic: Diagnostic,
    private media: Media,
    private alertCtrl: AlertController
  ) {
    console.log("Hello ImageUploadComponent Component");
    this.text = "Hello World";
    this.isIos = this.platform.is("ios") ? true : false;
    if (this.isIos) {
      this.file
        .checkDir(this.file.documentsDirectory, "images")
        .then((success) => {})
        .catch((err) => {
          this.file
            .createDir(cordova.file.documentsDirectory, "images", false)
            .then(
              (success) => {},
              (error) => {}
            );
        });
    } else {
      this.file
        .checkDir(this.file.externalDataDirectory, "images")
        .then((success) => {})
        .catch((err) => {
          this.file
            .createDir(cordova.file.externalDataDirectory, "images", false)
            .then(
              (success) => {},
              (error) => {}
            );
        });
    }
  }

  ngOnInit() {
    // this.storage.get(this.generalQuestion ? 'genericQuestionsImages' : 'allImageList').then(data => {
    //   this.allLocalImageList = JSON.parse(data) ? JSON.parse(data) : {};
    //   console.log(data + "On init")
    //   if (!this.generalQuestion) {
    //     if (this.allLocalImageList[this.submissionId]) {
    //       this.allLocalImageList[this.submissionId][this.evidenceId] = (this.allLocalImageList[this.submissionId][this.evidenceId]) ? this.allLocalImageList[this.submissionId][this.evidenceId] : []
    //     } else {
    //       console.log(this.submissionId + " " + this.evidenceId)
    //       this.allLocalImageList[this.submissionId] = {};
    //       this.allLocalImageList[this.submissionId][this.evidenceId] = []
    //       this.localEvidenceImageList = [];
    //     }
    //   } else {
    //     if (this.allLocalImageList[this.submissionId]) {
    //       this.allLocalImageList[this.submissionId] = (this.allLocalImageList[this.submissionId]) ? this.allLocalImageList[this.submissionId] : []
    //     } else {
    //       this.allLocalImageList[this.submissionId] = [];
    //       this.localEvidenceImageList = [];
    //     }
    //   }
    //   // this.allLocalImageList = JSON.parse(data) ? JSON.parse(data) : {};
    //   // this.localEvidenceImageList = (this.allLocalImageList && this.allLocalImageList[this.evidenceId]) ? this.allLocalImageList[this.evidenceId] : [];
    // })
    this.appFolderPath = this.isIos
      ? cordova.file.documentsDirectory + "images"
      : cordova.file.externalDataDirectory + "images";
  }

  openActionSheet(): void {
    let translateObject;
    this.translate
      .get([
        "actionSheet.addImage",
        "actionSheet.camera",
        "actionSheet.uploadFile",
        "actionSheet.uploadImage",
        "actionSheet.upload",
        "actionSheet.cancel",
      ])
      .subscribe((translations) => {
        translateObject = translations;
      });
    const actionSheet = this.actionSheet.create({
      title: translateObject["actionSheet.addImage"],
      buttons: [
        {
          text: translateObject["actionSheet.camera"],
          role: "destructive",
          icon: "camera",
          handler: () => {
            this.openCamera();
          },
        },
        {
          text: translateObject["actionSheet.uploadImage"],
          icon: "cloud-upload",
          handler: () => {
            this.openLocalLibrary();
          },
        },
        {
          text: translateObject["actionSheet.uploadFile"],
          icon: "document",
          handler: () => {
            this.isIos ? this.filePickerForIOS() : this.openFilePicker();
          },
        },
        {
          text: translateObject["actionSheet.cancel"],
          role: "cancel",
          handler: () => {},
        },
      ],
    });
    actionSheet.present();
  }

  filePickerForIOS() {
    this.iosFilePicker
      .pickFile()
      .then((data) => {
        this.checkForLocalFolder("file://" + data);
      })
      .catch((error) => {});
  }

  // For android
  openFilePicker() {
    this.fileChooser
      .open()
      .then((filePath) => {
        this.filePath
          .resolveNativePath(filePath)
          .then((data) => {
            this.checkForLocalFolder(data);
          })
          .catch((err) => {});
      })
      .catch((e) => console.log(e));
  }

  openCamera(): void {
    const options: CameraOptions = {
      quality: 10,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: this.camera.PictureSourceType.CAMERA,
    };
    this.camera
      .getPicture(options)
      .then((imagePath) => {
        this.checkForLocalFolder(imagePath);
        this.saveToLibrary(imagePath);
      })
      .catch((error) => {});
  }

  saveToLibrary(url): void {
    this.photoLibrary
      .saveImage(url, "samiksha")
      .then((data) => {})
      .catch((error) => {});
  }

  checkForLocalFolder(imagePath) {
    let currentName = imagePath.substr(imagePath.lastIndexOf("/") + 1);
    let currentPath = imagePath.substr(0, imagePath.lastIndexOf("/") + 1);
    if (this.isIos) {
      this.file
        .checkDir(this.file.documentsDirectory, "images")
        .then((success) => {
          this.copyFileToLocalDir(currentPath, currentName);
        })
        .catch((err) => {
          this.file
            .createDir(cordova.file.documentsDirectory, "images", false)
            .then(
              (success) => {
                this.copyFileToLocalDir(currentPath, currentName);
              },
              (error) => {}
            );
        });
    } else {
      this.file
        .checkDir(this.file.externalDataDirectory, "images")
        .then((success) => {
          this.copyFileToLocalDir(currentPath, currentName);
        })
        .catch((err) => {
          this.file
            .createDir(cordova.file.externalDataDirectory, "images", false)
            .then(
              (success) => {
                this.copyFileToLocalDir(currentPath, currentName);
              },
              (error) => {}
            );
        });
    }
  }

  createFileName() {
    let d = new Date(),
      n = d.getTime(),
      newFileName = n + ".jpg";
    return newFileName;
  }

  copyFileToLocalDir(namePath, currentName) {
    // this.file.resolveLocalFilesystemUrl(namePath).then(succes => {
    //   console.log("Resolved  path " + JSON.stringify(succes.nativeURL))
    // }).catch(error => {

    // })
    this.file
      .copyFile(namePath, currentName, this.appFolderPath, currentName)
      .then(
        (success) => {
          this.pushToFileList(currentName);
        },
        (error) => {}
      );
  }

  pushToFileList(fileName) {
    this.file
      .checkFile(this.appFolderPath + "/", fileName)
      .then((response) => {
        // if (this.imageFormats.indexOf(this.getExtensionFromName(fileName)) >= 0) {
        //   console.log("check file if readAsDataURL")

        //   setTimeout(()=>{
        //     console.log()
        //     this.file.readAsDataURL(this.appFolderPath, fileName).then(data => {
        //       console.log("read as dataurl success");

        //       this.imageList.push({ data: data, imageName: fileName, extension: this.getExtensionFromName(fileName) });
        //       this.setLocalDatas(fileName);
        //     }).catch(err => {
        //       console.log(JSON.stringify(err))
        //       console.log("read as dataurl failure");

        //     })
        //   })

        // } else {
        this.imageList.push({
          data: "",
          imageName: fileName,
          extension: this.getExtensionFromName(fileName),
        });
        this.setLocalDatas(fileName);
        // this.updateLocalImageList();
        // }
      })
      .catch((error) => {});
  }

  setLocalDatas(fileName) {
    this.datas.fileName.push(fileName);
    // if (!this.generalQuestion) {
    //   this.allLocalImageList[this.submissionId][this.evidenceId].push({ name: fileName, uploaded: false });
    // } else {
    //   this.allLocalImageList[this.submissionId].push({ name: fileName, uploaded: false });
    // }
    this.updateLocalImageList();
  }

  getExtensionFromName(fileName) {
    let splitString = fileName.split(".");
    let extension = splitString[splitString.length - 1];
    return extension;
  }

  createImageFromName(imageList) {
    this.isIos = this.platform.is("ios") ? true : false;
    this.appFolderPath = this.isIos
      ? cordova.file.documentsDirectory + "images"
      : cordova.file.externalDataDirectory + "images";
    for (const image of imageList) {
      this.file
        .checkFile(this.appFolderPath + "/", image)
        .then((response) => {
          // if (this.imageFormats.indexOf(this.getExtensionFromName(image)) >= 0) {
          //   this.file.readAsDataURL(this.appFolderPath, image).then(data => {
          //     this.imageList.push({ data: data, imageName: image, extension: this.getExtensionFromName(image) });
          //     // this.setLocalDatas(fileName);
          //   }).catch(err => {
          //   })
          // } else {
          this.imageList.push({
            data: "",
            imageName: image,
            extension: this.getExtensionFromName(image),
          });
          // this.setLocalDatas(image);
          // this.updateLocalImageList();
          // }
        })
        .catch((error) => {
          this.imageList.push(image);
        });
    }
  }

  openLocalLibrary(): void {
    const options: ImagePickerOptions = {
      maximumImagesCount: 50,
      quality: 10,
    };
    this.imgPicker.getPictures(options).then((imageData) => {
      for (const image of imageData) {
        this.checkForLocalFolder(image);
      }
    });
  }

  removeImgFromList(index): void {
    let indexInLocalList;
    // if (!this.generalQuestion) {
    //   for (let i = 0; i < this.allLocalImageList[this.submissionId][this.evidenceId].length; i++) {
    //     if (this.allLocalImageList[this.submissionId][this.evidenceId].name === this.imageList[index].imageName) {
    //       indexInLocalList = i;
    //     }
    //   }
    //   this.allLocalImageList[this.submissionId][this.evidenceId].splice(indexInLocalList, 1);
    // } else {
    //   for (let i = 0; i < this.allLocalImageList[this.submissionId].length; i++) {
    //     if (this.allLocalImageList[this.submissionId].name === this.imageList[index].imageName) {
    //       indexInLocalList = i;
    //     }
    //   }
    //   this.allLocalImageList[this.submissionId].splice(indexInLocalList, 1);
    // }
    this.datas.fileName.splice(index, 1);
    this.imageList.splice(index, 1);
    this.updateLocalImageList();
  }

  deleteImageAlert(index) {
    let translateObject;
    this.translate
      .get([
        "actionSheet.confirmDelete",
        "actionSheet.confirmDeleteInstance",
        "actionSheet.no",
        "actionSheet.yes",
      ])
      .subscribe((translations) => {
        translateObject = translations;
        console.log(JSON.stringify(translations));
      });
    let alert = this.alertCtrl.create({
      title: translateObject["actionSheet.confirmDelete"],
      message: translateObject["actionSheet.confirmDeleteInstance"],
      buttons: [
        {
          text: translateObject["actionSheet.no"],
          role: "cancel",
          handler: () => {},
        },
        {
          text: translateObject["actionSheet.yes"],
          handler: () => {
            this.removeImgFromList(index);
          },
        },
      ],
    });
    alert.present();
  }

  updateLocalImageList() {
    // this.localStorage.getLocalStorage(this.generalQuestion ? 'genericQuestionsImages' : 'allImageList').then( data =>{
    //   data = JSON.parse(data);
    //   if(!this.generalQuestion)
    //   data[this.submissionId][this.evidenceId] = [...data[this.submissionId][this.evidenceId], ...this.allLocalImageList][this.submissionId][this.evidenceId] ;
    //   else
    //   data[this.submissionId] = [ ... data[this.submissionId] , ... this.allLocalImageList][this.submissionId] ;
    //   this.localStorage.setLocalStorage(this.generalQuestion ? 'genericQuestionsImages' : 'allImageList' , JSON.stringify(data))
    //   // this.utils.setLocalImages(this.allLocalImageList, this.generalQuestion);
    //   this.localStorage.getLocalStorage(this.generalQuestion ? 'genericQuestionsImages' : 'allImageList').then( data =>{
    //     console.log(data   + " updating");
    //     this.allLocalImageList = JSON.parse(data)
    // }).catch(error =>{});
    // }).catch( data =>{
    //   this.localStorage.setLocalStorage(this.generalQuestion ? 'genericQuestionsImages' : 'allImageList' , JSON.stringify(this.allLocalImageList));
    //   this.localStorage.getLocalStorage(this.generalQuestion ? 'genericQuestionsImages' : 'allImageList').then( data =>{
    //     console.log(data + " setting");
    //     this.allLocalImageList = JSON.parse(data)
    // }).catch(error =>{});
    // })
  }

  previewFile(fileName, extension) {
    this.fileOpener
      .open(
        this.appFolderPath + "/" + fileName,
        FILE_EXTENSION_HEADERS[extension]
      )
      .then(() => console.log("File is opened"))
      .catch((e) => {
        this.utils.openToast("No file readers available");
      });
  }

  mediaObject;

  startRecord() {
    if (this.platform.is("ios")) {
      console.log("inside ios");
      this.file
        .checkDir(this.file.documentsDirectory, "images")
        .then((success) => {
          this.fileName =
            "record" +
            new Date().getDate() +
            new Date().getMonth() +
            new Date().getFullYear() +
            new Date().getHours() +
            new Date().getMinutes() +
            new Date().getSeconds() +
            ".mp3";
          this.filesPath =
            this.file.documentsDirectory + "images/" + this.fileName;
          this.file
            .createFile(this.file.tempDirectory, this.fileName, true)
            .then(() => {
              this.mediaObject = this.media.create(
                this.file.tempDirectory.replace(/^file:\/\//, "") +
                  this.fileName
              );
              this.mediaObject.startRecord();
              this.startTimer();
            })
            .catch((error) => {
              this.utils.openToast("Something went wrong");
            });
        })
        .catch((err) => {
          this.file
            .createDir(cordova.file.documentsDirectory, "images", false)
            .then(
              (success) => {
                this.fileName =
                  "record" +
                  new Date().getDate() +
                  new Date().getMonth() +
                  new Date().getFullYear() +
                  new Date().getHours() +
                  new Date().getMinutes() +
                  new Date().getSeconds() +
                  ".mp3";
                this.filesPath =
                  this.file.documentsDirectory + "images/" + this.fileName;
                this.mediaObject = this.media.create(
                  this.file.tempDirectory.replace(/^file:\/\//, "") +
                    this.fileName
                );
                this.mediaObject.startRecord();
                // this.audio = this.media.create(this.filesPath);
                // this.audio.startRecord();
                this.startTimer();
              },
              (error) => {}
            );
        });
    } else if (this.platform.is("android")) {
      this.file
        .checkDir(this.file.externalDataDirectory, "images")
        .then((success) => {
          this.fileName =
            "record" +
            new Date().getDate() +
            new Date().getMonth() +
            new Date().getFullYear() +
            new Date().getHours() +
            new Date().getMinutes() +
            new Date().getSeconds() +
            ".mp3";
          this.filesPath =
            this.file.externalDataDirectory + "images/" + this.fileName;
          this.audio = this.media.create(this.filesPath);
          this.startTimer();
          this.audio.startRecord();
        })
        .catch((err) => {
          this.file
            .createDir(cordova.file.externalDataDirectory, "images", false)
            .then(
              (success) => {
                this.fileName =
                  "record" +
                  new Date().getDate() +
                  new Date().getMonth() +
                  new Date().getFullYear() +
                  new Date().getHours() +
                  new Date().getMinutes() +
                  new Date().getSeconds() +
                  ".mp3";
                this.filesPath =
                  this.file.externalDataDirectory + "images/" + this.fileName;
                this.audio = this.media.create(this.filesPath);
                this.startTimer();
                this.audio.startRecord();
              },
              (error) => {}
            );
        });
    }
  }

  startTimer() {
    this.recording = true;
    if (this.recording) {
      this.interval = setInterval(() => {
        if (this.timeLeft >= 0) {
          this.timeLeft++;
          console.log(this.timeLeft);
          this.minutes = Math.ceil(this.timeLeft / 60) - 1;
          this.seconds = Math.floor(this.timeLeft % 60);
        } else {
          this.timeLeft = 0;
          this.minutes = 0;
          this.seconds = 0;
        }
      }, 1000);
    }
  }
  checkRecordMediaPermission() {
    this.diagnostic
      .isMicrophoneAuthorized()
      .then((success) => {
        console.log(JSON.stringify(success));
        this.diagnostic
          .requestMicrophoneAuthorization()
          .then((success) => {
            console.log("inside success of permission ");
            console.log(success === "true");
            console.log(success);
            if (success === "authorized" || success === "GRANTED") {
              const permissionsArray = [
                this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE,
                this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE,
                this.androidPermissions.PERMISSION.RECORD_AUDIO,
              ];
              this.androidPermissions
                .requestPermissions(permissionsArray)
                .then((successResult) => {
                  successResult.hasPermission
                    ? this.startRecord()
                    : this.utils.openToast(
                        "Please accept the permissions to use this feature"
                      );
                })
                .catch((error) => {
                  this.utils.openToast(
                    "Please accept the permissions to use this feature"
                  );
                });
            } else {
              this.utils.openToast(
                "Please accept the permissions to use this feature"
              );
            }
          })
          .catch((error) => {
            console.log("Please accept the permissions to use this feature");
          });
      })
      .catch((error) => {
        console.log(JSON.stringify(error));
      });
    // const permissionsArray = [
    //   this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE,
    //   this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE,
    //   this.androidPermissions.PERMISSION.RECORD_AUDIO
    // ]
    // this.androidPermissions.requestPermissions(permissionsArray).then(success => {
    //   success.hasPermission ? this.startRecord() : this.utils.openToast("Please accept the permissions to use this feature")
    // }).catch(error => {
    //   this.utils.openToast("Please accept the permissions to use this feature")
    // })
  }

  stopRecord() {
    this.recording = false;
    this.timeLeft = 0;
    this.minutes = 0;
    this.seconds = 0;
    clearInterval(this.interval);
    if (this.isIos) {
      this.mediaObject.stopRecord();
      this.mediaObject.release();
      this.file
        .copyFile(
          this.file.tempDirectory,
          this.fileName,
          this.appFolderPath,
          this.fileName
        )
        .then(
          (success) => {
            console.log("inside copy success");
            this.file.removeFile(this.file.tempDirectory, this.fileName);
            this.pushToFileList(this.fileName);
          },
          (error) => {}
        );
    } else {
      this.audio.stopRecord();
      this.audio.release();
      this.pushToFileList(this.fileName);
    }
  }
}
