import { Component, ViewChild, ElementRef } from "@angular/core";
import {
  IonicPage,
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
/**
 * Generated class for the ReportsWithScorePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-reports-with-score",
  templateUrl: "reports-with-score.html",
})
export class ReportsWithScorePage {
  reportObj;
  submissionId;
  observationId;
  entityId;
  error;
  payload;
  appFolderPath;
  isIos;
  fileName;
  action;
  solutionId: string;
  entityType: string;
  reportType: string;
  allQuestions: Array<Object> = [];
  filteredQuestions: Array<any> = [];
  selectedTab: string;
  filteredCriterias: any = [];
  allCriterias: any = [];
  reportObjCriteria: any;
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
    private apiService: ApiProvider,
    private file: File,
    private modal: ModalController
  ) {}

  ionViewDidEnter() {
    this.selectedTab = "questionwise";

    this.submissionId = this.navParams.get("submissionId");
    this.observationId = this.navParams.get("observationId");
    this.entityId = this.navParams.get("entityId");
    this.solutionId = this.navParams.get("solutionId");
    this.entityType = this.navParams.get("entityType");
    this.reportType = this.navParams.get("reportType");
    this.from = this.navParams.get("from");

    this.payload = {
      entityId: this.entityId,
      submissionId: this.submissionId,
      observationId: this.observationId,
    };
    this.isIos = this.platform.is("ios") ? true : false;
    this.appFolderPath = this.isIos
      ? cordova.file.documentsDirectory + "/Download/"
      : cordova.file.externalRootDirectory + "/Download/";
    // this.appFolderPath = this.isIos ? cordova.file.externalRootDirectory + '/Download/' : cordova.file.externalRootDirectory + '/Download/';
    this.getObservationReports();
  }

  getObservationReports(download = false) {
    this.utils.startLoader();
    let url;

    if (this.solutionId) {
      this.payload.solutionId = this.solutionId;
      this.payload.entityType = this.entityType;
      this.payload.reportType = this.reportType;
      url = AppConfigs.observationReportsWithScore.solutionReport;
    } else if (this.submissionId) {
      // view submission report
      url = AppConfigs.observationReportsWithScore.instanceReport;
    } else if (this.observationId && this.entityId) {
      // view entity report
      this.payload.entityType = this.entityType;
      url = AppConfigs.observationReportsWithScore.entityReport;
    } else {
      this.payload.entityType = this.entityType;
      url = AppConfigs.observationReportsWithScore.observationReport;
    }
    this.payload.filter = {
      questionId: this.filteredQuestions,
    };

    this.apiService.httpPost(
      url,
      this.payload,
      (success) => {
        console.log(JSON.stringify(success));
        this.allQuestions =
          success.allQuestions && !this.allQuestions.length
            ? success.allQuestions
            : this.allQuestions;
        if (success) {
          this.error = !success.result ? success.message : null;
          this.reportObj = success;
        } else {
          this.error = "No data found";
          this.utils.openToast(this.error);
        }
        this.utils.stopLoader();
        !this.filteredQuestions.length ? this.markAllQuestionSelected() : null;
      },
      (error) => {
        this.error = "No data found";
        this.utils.openToast(error.message);
        this.utils.stopLoader();
      },
      {
        baseUrl: "dhiti",
        version: this.observationId && this.entityId ? "v2" : "v1",
      }
    );
  }

  getObservationCriteriaReports() {
    this.utils.startLoader();
    let url;

    if (this.entityType && this.reportType) {
      this.payload.solutionId = this.solutionId;
      this.payload.entityType = this.entityType;
      this.payload.reportType = this.reportType;
      //  url = AppConfigs.observationReportsWithScore.solutionReport;
      // url = AppConfigs.criteriaReports.entitySolutionReport;
    } else if (this.submissionId) {
      url = AppConfigs.criteriaReportsWithScore.instanceReport;
    } else if (!this.submissionId && !this.entityId) {
      this.payload.entityType = this.entityType;

      url = AppConfigs.criteriaReportsWithScore.observationReport;
    } else {
      url = AppConfigs.criteriaReportsWithScore.entityReport;
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
  getObservationReportUrl() {
    this.utils.startLoader();
    // + "type=submission&"
    let url =
      this.selectedTab == "questionwise"
        ? AppConfigs.observationReportsWithScore.getReportsPdfUrls
        : AppConfigs.criteriaReportsWithScore.getReportsPdfUrls;
    const timeStamp =
      "_" + this.datepipe.transform(new Date(), "yyyy-MMM-dd-HH-mm-ss a");
    if (this.solutionId) {
      this.fileName = this.solutionId + timeStamp + ".pdf";
    } else if (this.submissionId) {
      this.fileName = this.submissionId + timeStamp + ".pdf";
    } else if (this.observationId && this.entityId) {
      this.fileName =
        this.observationId + `_${this.entityId}_` + timeStamp + ".pdf";
    } else if (this.observationId) {
      this.fileName = this.observationId + timeStamp + ".pdf";
    }
    this.apiService.httpPost(
      url,
      this.payload,
      (success) => {
        this.utils.stopLoader();
        if (success.status === "success" && success.pdfUrl) {
          this.downloadSubmissionDoc(success.pdfUrl);
        } else {
          this.utils.openToast(success.message);
        }
        this.utils.stopLoader();
      },
      (error) => {
        this.error = "No data found";
        this.utils.stopLoader();
      },
      {
        baseUrl: "dhiti",
        version:
          this.selectedTab == "criteriawise"
            ? "v1"
            : this.observationId && this.entityId
            ? "v2"
            : "v1",
        // version: this.observationId && this.entityId ? "v2" : "v1",
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
      })
      .catch((error) => {});
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
              this.filedownload(fileRemoteUrl);
            },
            (error) => {}
          );
      });
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
    this.fab.close();
    this.selectedTab = tabName;
    !this.allCriterias.length ? this.getObservationCriteriaReports() : null;
  }
}
