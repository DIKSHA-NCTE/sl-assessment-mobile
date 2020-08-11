import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AppConfigs } from "../../../providers/appConfig";
import { ApiProvider } from "../../../providers/api/api";
import { UtilsProvider } from "../../../providers/utils/utils";
import { LocalStorageProvider } from "../../../providers/local-storage/local-storage";
import { storageKeys } from "../../../providers/storageKeys";
import { FileTransfer, FileTransferObject } from "@ionic-native/file-transfer";
import { File } from "@ionic-native/file";
import { Platform } from "ionic-angular";
import { DomSanitizer } from "@angular/platform-browser";

/*
  Generated class for the LibraryProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class LibraryProvider {
  private win: any = window;
  isIos: boolean = false;
  filePath: any;

  constructor(
    public http: HttpClient,
    public apiService: ApiProvider,
    public utils: UtilsProvider,
    public localStorage: LocalStorageProvider,
    public transfer: FileTransfer,
    public file: File,
    private platform: Platform,
    private sanitizer: DomSanitizer

  ) {
    console.log("Hello LibraryProvider Provider");
    this.isIos = this.platform.is("ios") ? true : false;
    this.filePath = this.isIos ? this.file.documentsDirectory : this.file.externalDataDirectory;
  }

  getImgContent(file) {
    return this.sanitizer.bypassSecurityTrustUrl(file);
  }

  getUrl(type, list?) {
    switch (type) {
      case "observation":
        return list
          ? AppConfigs.library.observationSolutionsList
          : AppConfigs.library.observationTemplateDetail;
      case "individual":
        return list
          ? AppConfigs.library.individualSolutionsList
          : AppConfigs.library.individualTemplateDetail;
      case "institutional":
        return list
          ? AppConfigs.library.institutionalSolutionsList
          : AppConfigs.library.institutionalTemplateDetail;

      default:
        break;
    }
  }
  getObservationSolutionsList(type, search, page) {
    search.length ? null : this.utils.startLoader();
    const url =
      this.getUrl(type, "list") + `?search=${search}&page=${page}&limit=10`;
    return new Promise((resolve, reject) => {
      this.apiService.httpGet(
        url,
        (successData) => {
          search.length ? null : this.utils.stopLoader();
          resolve(successData.result);
        },
        (error) => {
          search.length ? null : this.utils.stopLoader();
          reject();
        }
      );
    });
  }

  getSolutiontemplate(solutionId, type) {
    this.localStorage.deleteOneStorage(storageKeys.libraryCategories);
    this.utils.startLoader();
    const url = this.getUrl(type) + solutionId;
    return new Promise((resolve, reject) => {
      this.apiService.httpGet(
        url,
        (successData) => {
          this.utils.stopLoader();
          resolve(successData.result);
        },
        (error) => {
          this.utils.stopLoader();
          reject();
        }
      );
    });
  }

  getSolutionMetaForm(solutionId, type) {
    this.utils.startLoader();
    const url =
      type == "observation"
        ? AppConfigs.cro.getCreateObservationMeta + solutionId
        : AppConfigs.library.assessmentMeta + solutionId;

    return new Promise((resolve, reject) => {
      this.apiService.httpGet(
        url,
        (successData) => {
          this.utils.stopLoader();
          resolve(successData.result);
        },
        (error) => {
          this.utils.stopLoader();
          reject();
        }
      );
    });
  }

  /* OA-Observation and assessment (individual and institutional) */
  createOA(payload, solutionId, type) {
    const url =
      type == "observation"
        ? AppConfigs.cro.createObservation + solutionId
        : AppConfigs.library.createAssessment + solutionId;

    return new Promise((resolve, reject) => {
      this.apiService.httpPost(
        url,
        payload,
        (success) => {
          this.utils.openToast(success.message);
          resolve(success);
        },
        (error) => {
          reject();
        },
        type == "observation" ? { version: "v2" } : { version: "v1" }
      );
    });
  }

  getPrivateProgram() {
    return new Promise((resolve, reject) => {
      const url = AppConfigs.library.privateProgram;

      this.apiService.httpGet(
        url,
        (successData) => {
          resolve(successData.result);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  getLibraryDraft() {
    return this.localStorage
      .getLocalStorage(storageKeys.libraryDraft)
      .then((items) => {
        return items;
      })
      .catch((err) => {
        this.localStorage.setLocalStorage(storageKeys.libraryDraft, []);
        return [];
      });
  }

  saveLibraryDraft(value) {
    return this.localStorage.setLocalStorage(storageKeys.libraryDraft, value);
  }

  deleteDraft(draftTime: any) {
    return this.getLibraryDraft()
      .then((allDraft) => allDraft.filter((d) => d.time !== draftTime))
      .then((allDraft) => this.saveLibraryDraft(allDraft))
      .catch((err) => { });
  }

  getLibraryCategories() {
    return new Promise((resolve, reject) => {
      this.localStorage
        .getLocalStorage(storageKeys.libraryCategories)
        .then((categories) => {
          resolve(categories);
        })
        .catch((err) => {
          return this.getLibraryCategoryApi();
        })
        .then((res) => {
          this.localStorage.setLocalStorage(storageKeys.libraryCategories, res);
          return res;
        })
        .then((res: any) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  getLibraryCategoryApi() {
    const url = AppConfigs.library.categories;
    return new Promise((resolve, reject) => {
      this.apiService.httpGet(
        url,
        async (successData) => {
          for (const element of successData["result"]) {
            await this.download(element.url, element.type).then(
              (safeurl) => (element.localUrl = safeurl)
            );
          }
          resolve(successData.result);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  download(url, name) {
    const fileTransfer: FileTransferObject = this.transfer.create();

    return fileTransfer
      .download(url, this.filePath + name + ".png")
      .then(
        (entry) => {
          return this.win.Ionic.WebView.convertFileSrc(entry.nativeURL);
        },
        (error) => {
          console.log("error!");
        }
      );
  }

  getLibrarySearchSolutions(solutionName, page) {
    return new Promise((resolve, reject) => {
      const url =
        AppConfigs.library.searchSolutions +
        solutionName +
        `&page=${page}&limit=15`;

      this.apiService.httpGet(
        url,
        (successData) => {
          resolve(successData.result);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }
}
