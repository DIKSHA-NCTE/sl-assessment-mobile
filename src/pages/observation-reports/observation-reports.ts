import { Component, ViewChild } from "@angular/core";
import {
  NavController,
  NavParams,
  Platform,
  ModalController,
  FabContainer,
} from "ionic-angular";
import { ApiProvider } from "../../providers/api/api";
import { AppConfigs } from "../../providers/appConfig";
import { File } from "@ionic-native/file";
import { DownloadAndPreviewProvider } from "../../providers/download-and-preview/download-and-preview";
import { FileTransfer, FileTransferObject } from "@ionic-native/file-transfer";
import { UtilsProvider } from "../../providers/utils/utils";
import { AndroidPermissions } from "@ionic-native/android-permissions";
import { DatePipe } from "@angular/common";
import { QuestionListPage } from "../question-list/question-list";
import { EvidenceAllListComponent } from "../../components/evidence-all-list/evidence-all-list";
import { CriteriaListPage } from "../criteria-list/criteria-list";

declare var cordova: any;
@Component({
  selector: "page-observation-reports",
  templateUrl: "observation-reports.html",
})
export class ObservationReportsPage {
  reportObj;
  submissionId;
  observationId;
  solutionId;
  entityId;
  error;
  payload;
  appFolderPath;
  isIos;
  fileName;
  action;
  entityType;
  immediateChildEntityType;
  reportType: string;
  allQuestions: Array<Object> = [];
  filteredQuestions: Array<any> = [];
  selectedTab: any;
  reportObjCriteria: any;
  allCriterias: any = [];
  filteredCriterias: any = [];
  @ViewChild(FabContainer) fab: FabContainer;
  from: any;

  constructor(
    public navCtrl: NavController,
    private dap: DownloadAndPreviewProvider,
    public navParams: NavParams,
    private platform: Platform,
    private fileTransfer: FileTransfer,
    private utils: UtilsProvider,
    private androidPermissions: AndroidPermissions,
    private datepipe: DatePipe,
    private modal: ModalController,
    private apiService: ApiProvider,
    private file: File
  ) {}

  ionViewDidLoad() {
    this.selectedTab = "questionwise";

    this.submissionId = this.navParams.get("submissionId");
    this.observationId = this.navParams.get("observationId");
    this.solutionId = this.navParams.get("solutionId");
    this.entityId = this.navParams.get("entityId");
    this.entityType = this.navParams.get("entityType");
    this.from = this.navParams.get("from");
    this.immediateChildEntityType = this.navParams.get(
      "immediateChildEntityType"
    );
    this.reportType = this.navParams.get("reportType");
    this.payload = {
      entityId: this.entityId,
      submissionId: this.submissionId,
      observationId: this.observationId,
      entityType: this.entityType,
    };
    this.isIos = this.platform.is("ios") ? true : false;
    this.appFolderPath = this.isIos
      ? cordova.file.documentsDirectory + "/Download/"
      : cordova.file.externalRootDirectory + "/Download/";
    this.getObservationReports();
  }

  getObservationReports(download = false) {
    this.utils.startLoader();
    let url;
    // if (this.entityType) {
    //   this.payload = {
    //     entityId: this.entityId,
    //     entityType: this.entityType,
    //     solutionId: this.solutionId,
    //     immediateChildEntityType: this.immediateChildEntityType,
    //     reportType: this.reportType,
    //   };
    //   url = AppConfigs.observationReports.entitySolutionReport;
    // } else if (this.submissionId) {
    //   url = AppConfigs.observationReports.instanceReport;
    // } else if (!this.submissionId && !this.entityId) {
    //   url = AppConfigs.observationReports.observationReport;
    // } else {
    //   url = AppConfigs.observationReports.entityReport;
    // }

    if (this.entityType && this.reportType) {
      this.payload = {
        entityId: this.entityId,
        entityType: this.entityType,
        solutionId: this.solutionId,
        immediateChildEntityType: this.immediateChildEntityType,
        reportType: this.reportType,
      };
      url = AppConfigs.observationReports.entitySolutionReport;
    } else if (this.submissionId) {
      url = AppConfigs.observationReports.instanceReport;
    } else if (!this.submissionId && !this.entityId) {
      url = AppConfigs.observationReports.observationReport;
    } else {
      url = AppConfigs.observationReports.entityReport;
    }

    this.payload.filter = {
      questionId: this.filteredQuestions,
    };
    console.log(JSON.stringify(this.payload));
    this.apiService.httpPost(
      url,
      this.payload,
      (success) => {
        //this will be initialized only on page load
        this.allQuestions =
          success.allQuestions && !this.allQuestions.length
            ? success.allQuestions
            : this.allQuestions;
        if (success) {
          this.reportObj = success;
        } else {
          this.error = "No data found";
        }
        this.utils.stopLoader();
        !this.filteredQuestions.length ? this.markAllQuestionSelected() : null;
      },
      (error) => {
        this.error = "No data found";
        this.utils.stopLoader();
      },
      {
        baseUrl: "dhiti",
        version: this.entityType && this.reportType ? "v2" : "v1",
      }
    );
  }

  getObservationCriteriaReports() {
    this.utils.startLoader();
    let url;

    if (this.entityType && this.reportType) {
      this.payload = {
        entityId: this.entityId,
        entityType: this.entityType,
        solutionId: this.solutionId,
        immediateChildEntityType: this.immediateChildEntityType,
        reportType: this.reportType,
      };
      // url = AppConfigs.criteriaReports.entitySolutionReport;
    } else if (this.submissionId) {
      url = AppConfigs.criteriaReports.instanceReport;
    } else if (!this.submissionId && !this.entityId) {
      url = AppConfigs.criteriaReports.observationReport;
    } else {
      url = AppConfigs.criteriaReports.entityReport;
    }

    this.payload.filter = {
      criteria: this.filteredCriterias,
    };

    // this.payload.filter = {
    //   questionId: this.filteredQuestions,
    // };
    // console.log(JSON.stringify(this.payload));
    this.apiService.httpPost(
      url,
      this.payload,
      (success) => {
        //this will be initialized only on page load
        this.allCriterias =
          success.allCriterias && !this.allCriterias.length
            ? success.allCriterias
            : this.allCriterias;
        if (success) {
          this.reportObjCriteria = success;
        } else {
          this.error = "No data found";
        }

        this.utils.stopLoader();
        !this.filteredCriterias.length ? this.markAllCriteriaSelected() : null;
      },
      (error) => {
        this.error = "No data found";
        this.utils.stopLoader();
      },
      {
        baseUrl: "dhiti",
        version: "v1",
      }
    );
  }

  markAllQuestionSelected() {
    for (const question of this.allQuestions) {
      this.filteredQuestions.push(question["questionExternalId"]);
    }
  }

  markAllCriteriaSelected() {
    for (const criteria of this.allCriterias) {
      this.filteredCriterias.push(criteria["criteriaId"]);
    }
  }

  downloadSharePdf(action) {
    this.action = action;
    this.androidPermissions
      .checkPermission(
        this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE
      )
      .then((status) => {
        if (status.hasPermission) {
          this.getObservationReportUrl();
        } else {
          this.androidPermissions
            .requestPermission(
              this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE
            )
            .then((success) => {
              if (success.hasPermission) {
                this.getObservationReportUrl();
              }
            })
            .catch((error) => {});
        }
      });
  }

  // checkForSubmissionDoc(submissiond) {
  //   this.file.checkFile(this.appFolderPath, this.fileName).then(success => {
  //     this.action === 'share' ? this.dap.shareSubmissionDoc(this.appFolderPath + this.fileName) : this.dap.previewSubmissionDoc(this.appFolderPath + this.fileName)
  //   }).catch(error => {
  //     // this.getObservationReports(true)
  //     this.getObservationReportUrl();
  //   })
  // }

  getObservationReportUrl() {
    this.utils.startLoader();
    // + "type=submission&"
    let url =
      this.selectedTab == "questionwise"
        ? AppConfigs.observationReports.getReportsPdfUrls
        : AppConfigs.criteriaReports.getReportsPdfUrls;
    const timeStamp =
      "_" + this.datepipe.transform(new Date(), "yyyy-MMM-dd-HH-mm-ss a");
    // if (this.entityType) {
    //   // url = url + "entityId=" + this.entityId + "&solutionId=" + this.solutionId + '&reportType=' + this.reportType + '&entityType=' + this.entityType + (this.immediateChildEntityType ? ('&immediateChildEntityType=' + this.immediateChildEntityType) : "");
    //   this.fileName =
    //     this.solutionId +
    //     "_" +
    //     this.entityId +
    //     "_" +
    //     this.immediateChildEntityType +
    //     ".pdf";
    // } else
    if (this.submissionId) {
      // url = url + "submissionId=" + this.submissionId;
      this.fileName = this.submissionId + timeStamp + ".pdf";
    } else if (!this.submissionId && !this.entityId) {
      // url = url + "observationId=" + this.observationId;
      this.fileName = this.observationId + timeStamp + ".pdf";
    } else {
      // url = url + "entityId=" + this.entityId + "&observationId=" + this.observationId;
      this.fileName =
        this.entityId + "_" + this.observationId + timeStamp + ".pdf";
    }

    this.apiService.httpPost(
      url,
      this.payload,
      (success) => {
        this.utils.stopLoader();
        console.log(JSON.stringify(success));
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
      {
        baseUrl: "dhiti",
        version: this.selectedTab == "questionwise" ? "v2" : "v1",
      }
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
    // const fileName = this.solutionName.replace(/\s/g, '') + "_" + this.datepipe.transform(new Date(), 'yyyy-MMM-dd-HH-mm-ss a') + ".pdf";
    const fileTransfer: FileTransferObject = this.fileTransfer.create();
    fileTransfer
      .download(fileRemoteUrl, this.appFolderPath + this.fileName)
      .then((success) => {
        this.action === "share"
          ? this.dap.shareSubmissionDoc(this.appFolderPath + this.fileName)
          : this.dap.previewSubmissionDoc(this.appFolderPath + this.fileName);
        this.utils.stopLoader();
      })
      .catch((error) => {
        this.utils.stopLoader();
      });
  }

  checkForDowloadDirectory(fileRemoteUrl) {
    this.file
      .checkDir(this.file.documentsDirectory, "Download")
      .then((success) => {
        this.filedownload(fileRemoteUrl);
      })
      .catch((err) => {
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
            (error) => {}
          );
      });
  }

  openFilter() {
    const modal = this.modal.create(QuestionListPage, {
      allQuestions: this.allQuestions,
      filteredQuestions: JSON.parse(JSON.stringify(this.filteredQuestions)),
    });
    modal.present();
    modal.onDidDismiss((response) => {
      if (
        response &&
        response.action === "updated" &&
        JSON.stringify(response.filter) !==
          JSON.stringify(this.filteredQuestions)
      ) {
        this.filteredQuestions = response.filter;
        this.getObservationReports();
      }
    });
  }

  openCriteriaFilter() {
    const modal = this.modal.create(CriteriaListPage, {
      allCriterias: this.allCriterias,
      filteredCriterias: JSON.parse(JSON.stringify(this.filteredCriterias)),
    });
    modal.present();
    modal.onDidDismiss((response) => {
      if (
        response &&
        response.action === "updated" &&
        JSON.stringify(response.filter) !==
          JSON.stringify(this.filteredCriterias)
      ) {
        this.filteredCriterias = response.filter;
        this.getObservationCriteriaReports();
      }
    });
  }

  allEvidence(index) {
    console.log(this.allQuestions[index]);
    this.navCtrl.push(EvidenceAllListComponent, {
      submissionId: this.submissionId,
      observationId: this.observationId,
      entityId: this.entityId,
      questionExternalId: this.allQuestions[index]["questionExternalId"],
      entityType: this.entityType,
    });
  }

  onTabChange(tabName) {
    this.fab ? this.fab.close() : null;
    this.selectedTab = tabName;
    !this.allCriterias.length ? this.getObservationCriteriaReports() : null;
  }
}
