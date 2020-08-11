import { Component } from "@angular/core";
import { NavController, NavParams, Platform } from "ionic-angular";
import { AppConfigs } from "../../providers/appConfig";
import { ApiProvider } from "../../providers/api/api";
import { UtilsProvider } from "../../providers/utils/utils";
import { AndroidPermissions } from "@ionic-native/android-permissions";
import { DownloadAndPreviewProvider } from "../../providers/download-and-preview/download-and-preview";
import { FileTransfer, FileTransferObject } from "@ionic-native/file-transfer";
import { File } from "@ionic-native/file";
import { DatePipe } from "@angular/common";
import { SuggestedImprovementsPage } from "../improvement-project/suggested-improvements/suggested-improvements";
import { ThrowStmt } from "@angular/compiler";

/**
 * Generated class for the DashboardPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

declare var cordova: any;

@Component({
  selector: "page-dashboard",
  templateUrl: "dashboard.html",
})
export class DashboardPage {
  data: any;
  entity: any;
  programId: any;
  solutionId: any;
  action;
  appFolderPath;
  isIos;
  fileName;
  payload;
  solutionName;
  multiAssessmentsReport: any;
  submissionId: any;
  constructor(
    public navCtrl: NavController,
    public utils: UtilsProvider,
    public navParams: NavParams,
    private androidPermissions: AndroidPermissions,
    private dap: DownloadAndPreviewProvider,
    private fileTransfer: FileTransfer,
    private file: File,
    private datepipe: DatePipe,
    private platform: Platform,
    private apiProvider: ApiProvider
  ) {
    this.isIos = this.platform.is("ios");
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad DashboardPage");
    // this.data = this.navParams.get('data');
    this.entity = this.navParams.get("entity");
    this.programId = this.navParams.get("programId");
    this.solutionId = this.navParams.get("solutionId");
    this.solutionName = this.navParams.get("solutionName");
    this.multiAssessmentsReport = this.navParams.get("multiAssessmentsReport"); // for multi assessment get entity report
    this.submissionId = this.navParams.get("submissionId"); // for multi assessmetn get instance report
    this.getEntityRequestObject();
    this.appFolderPath = this.isIos
      ? cordova.file.documentsDirectory + "/Download/"
      : cordova.file.externalRootDirectory + "/Download/";
  }
  getEntityRequestObject() {
    console.log(JSON.stringify(this.entity));
    this.payload = {
      entityId: this.entity._id,
      programId: this.programId,
      solutionId: this.solutionId,
      entityType: this.entity.entityType,
      immediateChildEntityType: this.entity.immediateSubEntityType
        ? this.entity.immediateSubEntityType
        : this.entity.immediateChildEntityType
        ? this.entity.immediateChildEntityType
        : "",
    };
    this.submissionId ? (this.payload.submissionId = this.submissionId) : null;
    this.fileName =
      "submissionDoc_" +
      this.payload.programId +
      "_" +
      this.payload.entityId +
      "_" +
      this.payload.entityType +
      ".pdf";
    this.getEntityReports(this.payload);
  }

  goToImpSugg() {
    let dataObj = {
      heading: this.solutionName,
      solutionId: this.solutionId,
      entityId: this.entity._id,
      entityType: this.entity.entityType,
      programId: this.programId,
    };
    this.navCtrl.push(SuggestedImprovementsPage, {
      dataObj,
    });
  }

  clickOnGraphEventEmit(event) {
    if (this.multiAssessmentsReport || this.submissionId) {
      /* 
        if intance and entity level reports for multiAssessmentsReport = true solution
        then click event on graph is not required
       */
      return;
    }
    console.log(JSON.stringify(event));
    let entityObj = {
      _id: event.entityId,
      entityType: event.nextChildEntityType,
      immediateChildEntityType: event.grandChildEntityType,
    };
    this.navCtrl.push(DashboardPage, {
      entity: entityObj,
      programId: this.programId,
      solutionId: this.solutionId,
    });
  }
  getEntityReports(obj) {
    console.log(JSON.stringify(obj));
    this.utils.startLoader();

    /*
      for solution having multiAssessmentsReport = false use old api to get report;
      for solution having multiAssessmentsReport = true use new api to get cummulative report for entity
      for solution having multiAssessmentsReport = true get instance report by passing submissionId to the new api
    */
    let url = this.multiAssessmentsReport
      ? AppConfigs.assessmentsList.assessmentReport
      : this.submissionId
      ? AppConfigs.assessmentsList.assessmentReport
      : AppConfigs.roles.instanceReport;
    this.apiProvider.httpPost(
      url,
      obj,
      (success) => {
        this.data = success;
        console.log(JSON.stringify(success));
        this.utils.stopLoader();
      },
      (error) => {
        this.utils.stopLoader();
        console.log("error");
        this.utils.openToast(error);
      },
      { baseUrl: "dhiti" }
    );
  }

  downloadSharePdf(action) {
    this.action = action;

    this.androidPermissions
      .checkPermission(
        this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE
      )
      .then((status) => {
        console.log(JSON.stringify(status));
        if (status.hasPermission) {
          this.getAssessmentPdfReportUrl();
        } else {
          this.androidPermissions
            .requestPermission(
              this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE
            )
            .then((success) => {
              if (success.hasPermission) {
                this.getAssessmentPdfReportUrl();
              }
            })
            .catch((error) => {});
        }
      });
  }

  // checkForSubmissionDoc() {
  //   this.file.checkFile(this.appFolderPath, this.fileName).then(success => {
  //     this.action === 'share' ? this.dap.shareSubmissionDoc(this.appFolderPath + this.fileName) : this.dap.previewSubmissionDoc(this.appFolderPath + this.fileName)
  //   }).catch(error => {
  //     this.getAssessmentPdfReportUrl();
  //   })
  // }

  getAssessmentPdfReportUrl() {
    this.utils.startLoader();
    let url = AppConfigs.roles.getAssessmentReportPdf;
    this.apiProvider.httpPost(
      url,
      this.payload,
      (success) => {
        this.utils.stopLoader();
        if (success.status === "success" && success.pdfUrl) {
          this.downloadSubmissionDoc(success.pdfUrl);
        } else {
          this.utils.openToast(success.message);
        }
      },
      (error) => {
        this.utils.openToast(error.message);

        this.utils.stopLoader();
      },
      { baseUrl: "dhiti" }
    );
  }

  downloadSubmissionDoc(fileRemoteUrl) {
    this.utils.startLoader();
    if (this.isIos) {
      this.checkForDowloadDirectory(fileRemoteUrl);
    } else {
      this.filedownload(fileRemoteUrl);
    }
  }

  filedownload(fileRemoteUrl) {
    const fileName =
      this.solutionName.replace(/\s/g, "") +
      "_" +
      this.datepipe.transform(new Date(), "yyyy-MMM-dd-HH-mm-ss a") +
      ".pdf";
    const fileTransfer: FileTransferObject = this.fileTransfer.create();
    fileTransfer
      .download(fileRemoteUrl, this.appFolderPath + fileName)
      .then((success) => {
        console.log("file dowload success");
        this.action === "share"
          ? this.dap.shareSubmissionDoc(this.appFolderPath + fileName)
          : this.dap.previewSubmissionDoc(this.appFolderPath + fileName);
        this.utils.stopLoader();
        console.log(JSON.stringify(success));
      })
      .catch((error) => {
        console.log("file dowload error");

        this.utils.stopLoader();
        console.log(JSON.stringify(error));
      });
  }

  checkForDowloadDirectory(fileRemoteUrl) {
    console.log("check for download");
    this.file
      .checkDir(this.file.documentsDirectory, "Download")
      .then((success) => {
        this.filedownload(fileRemoteUrl);
      })
      .catch((err) => {
        console.log("check for download");

        this.file
          .createDir(cordova.file.documentsDirectory, "Download", false)
          .then(
            (success) => {
              // this.fileName = 'record' + new Date().getDate() + new Date().getMonth() + new Date().getFullYear() + new Date().getHours() + new Date().getMinutes() + new Date().getSeconds() + '.mp3';
              // this.filesPath = this.file.documentsDirectory + "images/" + this.fileName;
              // this.audio = this.media.create(this.filesPath);
              // this.audio.startRecord();
              // this.startTimer();
              this.filedownload(fileRemoteUrl);
            },
            (error) => {
              console.log(JSON.stringify(error));
            }
          );
      });
  }
}
