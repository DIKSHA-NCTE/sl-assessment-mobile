import { Component } from "@angular/core";
import { NavController, NavParams, Platform, Events } from "ionic-angular";
import { UtilsProvider } from "../../providers/utils/utils";
import { Storage } from "@ionic/storage";
import { File } from "@ionic-native/file";
import {
  FileTransfer,
  FileUploadOptions,
  FileTransferObject,
} from "@ionic-native/file-transfer";
import { ApiProvider } from "../../providers/api/api";
import { AppConfigs } from "../../providers/appConfig";
import { SlackProvider } from "../../providers/slack/slack";
import { LocalStorageProvider } from "../../providers/local-storage/local-storage";
import { ObservationProvider } from "../../providers/observation/observation";
import { TranslateService } from "@ngx-translate/core";
import { ProgramServiceProvider } from "../programs/program-service";

declare var cordova: any;

@Component({
  selector: "page-image-listing",
  templateUrl: "image-listing.html",
})
export class ImageListingPage {
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private storage: Storage,
    private file: File,
    private fileTransfer: FileTransfer,
    private apiService: ApiProvider,
    private utils: UtilsProvider,
    private localStorage: LocalStorageProvider,
    private platform: Platform,
    private slack: SlackProvider,
    private events: Events,
    private translate: TranslateService,
    private observetionProvider: ObservationProvider,
    private programService: ProgramServiceProvider
  ) {}

  uploadImages: any;
  imageList = [];
  appFolderPath: string = this.platform.is("ios")
    ? cordova.file.documentsDirectory + "images"
    : cordova.file.externalDataDirectory + "images";
  // schoolId: any;
  schoolName: string;
  selectedEvidenceIndex: any;
  // currentEvidenceId: any;
  uploadIndex: number = 0;
  schoolData: any;
  currentEvidence: any;
  evidenceSections: any;
  selectedEvidenceName: any;
  imageLocalCopyId: any;
  retryCount: number = 0;
  page = "ECM submission page";
  failedUploadImageNames = [];
  errorObj = {
    fallback: "User Details",
    title: `Error Details`,
    text: ``,
  };
  submissionId;

  ionViewDidLoad() {
    this.submissionId = this.navParams.get("_id");
    this.schoolName = this.navParams.get("name");
    this.selectedEvidenceIndex = this.navParams.get("selectedEvidence");
    // this.currentEvidenceId = this.navParams.get('selectedEvidenceId');
    // console.log(this.submissionId + "Image listing")
    this.localStorage
      .getLocalStorage(
        this.utils.getAssessmentLocalStorageKey(this.submissionId)
      )
      .then((data) => {
        this.schoolData = data;
        // console.log(this.submissionId + "Image listing  success")
        this.currentEvidence = this.schoolData["assessment"]["evidences"][
          this.selectedEvidenceIndex
        ];
        this.imageLocalCopyId =
          "images_" + this.currentEvidence.externalId + "_" + this.submissionId;
        this.evidenceSections = this.currentEvidence["sections"];
        this.selectedEvidenceName = this.currentEvidence["name"];
        this.getAllImages();
      })
      .catch((error) => {
        // console.log(this.submissionId + "Image listing error")
      });
  }

  getAllImages() {
    let imageArray = [];
    for (const sections of this.currentEvidence.sections) {
      for (const question of sections.questions) {
        let questImage;
        if (question.responseType === "pageQuestions") {
          question.pageQuestions.forEach((element) => {
            questImage = this.utils.getImageNamesForQuestion(element);
            const newArray = questImage.length
              ? imageArray.concat(questImage)
              : imageArray;
            imageArray = newArray;
          });
        } else {
          questImage = this.utils.getImageNamesForQuestion(question);
          const newArray = questImage.length
            ? imageArray.concat(questImage)
            : imageArray;
          imageArray = newArray;
          // imageArray = questImage.length ? [...imageArray, ...questImage] : imageArray;
        }
      }
    }
    // console.log(JSON.stringify(imageArray));
    this.uploadImages = imageArray;
    this.checkIfEcmSumittedByUser();
  }

  checkIfEcmSumittedByUser() {
    this.utils.startLoader();
    const submissionId = this.submissionId;
    const url = this.schoolData.observation
      ? AppConfigs.cro.isSubmissionAllowed
      : AppConfigs.survey.checkIfSubmitted;
    this.apiService.httpGet(
      url + submissionId + "?evidenceId=" + this.currentEvidence.externalId,
      (success) => {
        this.utils.stopLoader();
        if (success.result.allowed) {
          // this.storage.get("allImageList").then(data => {
          //   console.log(data)
          //   if (data && JSON.parse(data)[this.submissionId]) {
          //     this.uploadImages = (JSON.parse(data)[this.submissionId][this.currentEvidence.externalId]) ? (JSON.parse(data)[this.submissionId][this.currentEvidence.externalId]) : [];
          //   } else {
          //     this.uploadImages = [];
          //   }
          if (this.uploadImages.length) {
            this.createImageFromName(this.uploadImages);
          } else {
            this.submitEvidence();
          }
          // })
        } else {
          this.translate
            .get("toastMessage.submissionCompleted")
            .subscribe((translations) => {
              this.utils.openToast(translations);
            });
          // if (this.schoolData['assessments'][0]) {
          //   this.schoolData['assessments'][0]['evidences'][this.selectedEvidenceIndex].isSubmitted = true;
          // } else {
          this.schoolData["assessment"]["evidences"][
            this.selectedEvidenceIndex
          ].isSubmitted = true;
          // }
          this.localStorage.setLocalStorage(
            this.utils.getAssessmentLocalStorageKey(this.submissionId),
            this.schoolData
          );
          const options = {
            _id: this.submissionId,
            name: this.schoolName,
          };
          this.navCtrl.remove(2, 1);
          this.navCtrl.pop();
        }
      },
      (error) => {
        this.utils.stopLoader();
      }
    );
  }

  getImageUploadUrls() {
    const submissionId = this.submissionId;
    const files = {
      files: [],
      submissionId: submissionId,
    };
    for (const image of this.uploadImages) {
      files.files.push(image);
    }
    this.apiService.httpPost(
      AppConfigs.survey.getImageUploadUr,
      files,
      (success) => {
        this.utils.stopLoader();
        for (let i = 0; i < success.result.length; i++) {
          this.imageList[i]["url"] = success.result[i].url;
          this.imageList[i]["sourcePath"] =
            success.result[i].payload.sourcePath;
          success.result[i].cloudStorage
            ? (this.imageList[i]["cloudStorage"] =
                success.result[i].cloudStorage)
            : null;
        }
        this.checkForLocalFolder();
      },
      (error) => {
        this.utils.stopLoader();
        this.translate
          .get("toastMessage.enableToGetGoogleUrls")
          .subscribe((translations) => {
            this.utils.openToast(translations);
          });
      }
    );
  }

  checkForLocalFolder() {
    if (this.platform.is("ios")) {
      this.file
        .checkDir(this.file.documentsDirectory, "images")
        .then((success) => {
          this.fileTransfer.create();
          this.cloudImageUpload();
        })
        .catch((err) => {});
    } else {
      this.file
        .checkDir(this.file.externalDataDirectory, "images")
        .then((success) => {
          this.cloudImageUpload();
          this.fileTransfer.create();
        })
        .catch((err) => {});
    }
  }

  createImageFromName(imageList) {
    this.utils.startLoader();
    for (const image of imageList) {
      this.imageList.push({ uploaded: false, file: image, url: "" });
    }
    this.getImageUploadUrls();
  }

  cloudImageUpload() {
    var options: FileUploadOptions = {
      fileKey: this.imageList[this.uploadIndex].file,
      fileName: this.imageList[this.uploadIndex].file,
      chunkedMode: false,
      mimeType: "image/jpeg",
      headers: {
        "Content-Type": "multipart/form-data",
        "x-ms-blob-type":
          this.imageList[this.uploadIndex].cloudStorage &&
          this.imageList[this.uploadIndex].cloudStorage === "AZURE"
            ? "BlockBlob"
            : null,
      },
      httpMethod: "PUT",
    };
    let targetPath = this.pathForImage(this.imageList[this.uploadIndex].file);
    let fileTrns: FileTransferObject = this.fileTransfer.create();

    this.file
      .checkFile(
        (this.platform.is("ios")
          ? this.file.documentsDirectory
          : this.file.externalDataDirectory) + "images/",
        this.imageList[this.uploadIndex].file
      )
      .then((success) => {
        fileTrns
          .upload(targetPath, this.imageList[this.uploadIndex].url, options)
          .then((result) => {
            this.retryCount = 0;
            this.imageList[this.uploadIndex].uploaded = true;
            if (this.uploadIndex < this.imageList.length - 1) {
              this.uploadIndex++;
              this.cloudImageUpload();
            } else {
              this.submitEvidence();
            }
          })
          .catch((err) => {
            const errorObject = { ...this.errorObj };
            this.retryCount++;
            if (this.retryCount > 3) {
              this.translate
                .get("toastMessage.someThingWentWrongTryLater")
                .subscribe((translations) => {
                  this.utils.openToast(translations);
                });
              errorObject.text = `${
                this.page
              }: Cloud image upload failed.URL:  ${
                this.imageList[this.uploadIndex].url
              }.
            Details: ${JSON.stringify(err)}`;
              this.slack.pushException(errorObject);
              this.navCtrl.pop();
            } else {
              this.cloudImageUpload();
            }
          });
      })
      .catch((error) => {
        this.failedUploadImageNames.push(this.imageList[this.uploadIndex].file);
        if (this.uploadIndex < this.imageList.length - 1) {
          this.uploadIndex++;
          this.cloudImageUpload();
        } else {
          this.submitEvidence();
        }
      });
  }

  pathForImage(img) {
    if (img === null) {
      return "";
    } else {
      const path = this.platform.is("ios")
        ? cordova.file.documentsDirectory
        : cordova.file.externalDataDirectory;
      return path + "images/" + img;
    }
  }

  submitEvidence() {
    this.utils.startLoader("Please wait while submitting");
    console.log("submitting");
    const payload = this.constructPayload();
    // console.log(JSON.stringify(payload));
    const submissionId = this.submissionId;
    const url =
      (this.schoolData.observation
        ? AppConfigs.cro.makeSubmission
        : AppConfigs.survey.submission) +
      submissionId +
      "/";
    this.apiService.httpPost(
      url,
      payload,
      (response) => {
        if (this.schoolData.observation) {
          this.observetionProvider.markObservationAsCompleted(submissionId);
        }
        this.utils.openToast(response.message);
        this.schoolData["assessment"]["evidences"][
          this.selectedEvidenceIndex
        ].isSubmitted = true;
        this.localStorage.setLocalStorage(
          this.utils.getAssessmentLocalStorageKey(this.submissionId),
          this.schoolData
        );
        const options = {
          _id: this.submissionId,
          name: this.schoolName,
        };
        this.utils.stopLoader();
        this.schoolData.observation
          ? this.events.publish("updateSubmissionStatus")
          : null;
        this.programService.refreshObservationList().then(() => {
          this.navCtrl.remove(this.navCtrl.getActive().index - 1, 1);
          this.navCtrl.pop();
        });
      },
      (error) => {
        this.utils.stopLoader();
      }
    );
  }

  ionViewDidLeave() {
    // this.schoolData.observation ?
    // this.events.unsubscribe('updateSubmissionStatus'):
    // null
  }

  constructPayload(): any {
    const payload = {
      evidence: {},
    };
    const evidence = {
      id: "",
      externalId: "",
      answers: {},
      startTime: 0,
      endTime: 0,
    };
    this.currentEvidence;
    const currentEvidence = this.currentEvidence;
    evidence.id = currentEvidence._id;
    evidence.externalId = currentEvidence.externalId;
    evidence.startTime = currentEvidence.startTime;
    evidence.endTime = Date.now();
    this.evidenceSections = this.pullOutPageQuestion();
    for (const section of this.evidenceSections) {
      for (const question of section.questions) {
        let obj = {
          qid: question._id,
          value:
            question.responseType === "matrix"
              ? this.constructMatrixObject(question)
              : question.value,
          remarks: question.remarks,
          fileName: [],
          gpsLocation: question.gpsLocation,
          payload: {
            question: question.question,
            labels: [],
            responseType: question.responseType,
            filesNotUploaded: [],
          },
          startTime: question.startTime,
          endTime: question.endTime,
        };

        if (question.fileName && question.fileName.length) {
          const filePaylaod = [];
          for (const fileName of question.fileName) {
            for (const updatedFileDetails of this.imageList) {
              if (fileName === updatedFileDetails.file) {
                const obj = {
                  name: fileName,
                  sourcePath: updatedFileDetails.sourcePath,
                };
                filePaylaod.push(obj);
              }
            }
          }
          obj.fileName = filePaylaod;
        }

        if (question.responseType === "multiselect") {
          for (const val of question.value) {
            for (const option of question.options) {
              if (
                val === option.value &&
                obj.payload.labels.indexOf(option.label) <= 0
              ) {
                obj.payload.labels.push(option.label);
              }
            }
          }
        } else if (question.responseType === "radio") {
          for (const option of question.options) {
            if (
              obj.value === option.value &&
              obj.payload.labels.indexOf(option.label) <= 0
            ) {
              obj.payload.labels.push(option.label);
            }
          }
        } else {
          obj.payload.labels.push(question.value);
        }
        for (const key of Object.keys(question.payload)) {
          obj[key] = question.payload[key];
        }
        evidence.answers[obj.qid] = obj;
        // console.log("i m here")
      }
    }

    payload.evidence = evidence;
    return payload;
  }

  pullOutPageQuestion() {
    console.log("Pull Out page Questions");
    // console.log(JSON.stringify(this.evidenceSections))
    let sections = this.evidenceSections;
    sections.forEach((section, sectionIndex) => {
      let questionsArray = [];
      section.questions.forEach((question) => {
        if (question.responseType === "pageQuestions") {
          const parentquestionGpsLocation = question.gpsLocation;
          question.pageQuestions.forEach((pageQuestion) => {
            pageQuestion.gpsLocation = parentquestionGpsLocation;
            questionsArray.push(pageQuestion);
          });
          questionsArray = [...questionsArray, ...question.pageQuestions];
        } else {
          questionsArray.push(question);
        }
      });
      this.evidenceSections[sectionIndex].questions = questionsArray;
    });

    console.log("After Pull Out page Questions");
    // console.log(JSON.stringify(this.evidenceSections))
    return this.evidenceSections;
  }

  constructMatrixObject(question) {
    const value = [];
    const currentEvidence = this.currentEvidence;

    for (const instance of question.value) {
      let eachInstance = {};
      for (let qst of instance) {
        const obj1 = {
          qid: qst._id,
          value: qst.value,
          remarks: qst.remarks,
          fileName: [],
          gpsLocation: qst.gpsLocation,
          payload: {
            question: qst.question,
            labels: [],
            responseType: qst.responseType,
          },
          startTime: qst.startTime,
          endTime: qst.endTime,
        };
        if (qst.fileName && qst.fileName.length) {
          const filePaylaod = [];
          for (const fileName of qst.fileName) {
            for (const updatedFileDetails of this.imageList) {
              if (fileName === updatedFileDetails.file) {
                const fileobj = {
                  name: fileName,
                  sourcePath: updatedFileDetails.sourcePath,
                };
                filePaylaod.push(fileobj);
              }
            }
          }
          obj1.fileName = filePaylaod;
        }
        if (qst.responseType === "multiselect") {
          for (const val of qst.value) {
            for (const option of qst.options) {
              if (
                val === option.value &&
                obj1.payload.labels.indexOf(option.label) <= 0
              ) {
                obj1.payload.labels.push(option.label);
              }
            }
          }
        } else if (qst.responseType === "radio") {
          for (const option of qst.options) {
            if (
              obj1.value === option.value &&
              obj1.payload.labels.indexOf(option.label) <= 0
            ) {
              obj1.payload.labels.push(option.label);
            }
          }
        } else {
          obj1.payload.labels.push(qst.value);
        }

        for (const key of Object.keys(qst.payload)) {
          obj1[key] = qst.payload[key];
        }
        eachInstance[obj1.qid] = obj1;
      }
      value.push(eachInstance);
    }

    return value;
  }
}
