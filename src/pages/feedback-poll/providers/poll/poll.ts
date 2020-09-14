import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { storageKeys } from "../../../../providers/storageKeys";
import { LocalStorageProvider } from "../../../../providers/local-storage/local-storage";
import { AppConfigs } from "../../../../providers/appConfig";
import { ApiProvider } from "../../../../providers/api/api";

/*
  Generated class for the PollProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class PollProvider {
  constructor(public http: HttpClient, public localStorage: LocalStorageProvider, private apiService: ApiProvider) {
    console.log("Hello PollProvider Provider");
  }

  getAllPollList() {
    const url = AppConfigs.poll.allPollList;
    return new Promise((resolve, reject) => {
      this.apiService.httpGet(
        url,
        (successData) => {
          resolve(successData.result);
        },
        () => {
          reject();
        }
      );
    });
  }

  getPolQuestions(pollId) {
    const url = AppConfigs.poll.pollQuestion + pollId;
    return new Promise((resolve, reject) => {
      this.apiService.httpGet(
        url,
        (successData) => {
          resolve(successData.result);
        },
        (err) => {
          reject(err);
        }
      );
    });
  }

  getPollResult(pollId: string) {
    const url = AppConfigs.poll.pollReport + pollId;
    return new Promise((resolve, reject) => {
      this.apiService.httpGet(
        url,
        (successData) => {
          resolve(successData.result);
        },
        (err) => {
          reject(err);
        }
      );
    });
  }

  submitPoll(body: {}, pollId) {
    const url = AppConfigs.poll.submitPoll + pollId;
    return new Promise((resolve, reject) => {
      this.apiService.httpPost(
        url,
        body,
        (successData) => {
          resolve(successData.result);
        },
        () => {
          reject();
        }
      );
    });
  }
  getPollQUestionByLink(pollId: any) {
    const url = AppConfigs.poll.getPollQUestionByLink + pollId;

    return new Promise((resolve, reject) => {
      this.apiService.httpGet(
        url,
        (successData) => {
          resolve(successData);
        },
        () => {
          reject();
        }
      );
    });
  }

  getPollList() {
    const url = AppConfigs.poll.pollList;
    return new Promise((resolve, reject) => {
      this.apiService.httpGet(
        url,
        (successData) => {
          resolve(successData.result);
        },
        () => {
          reject();
        }
      );
    });
  }

  deleteDraft(draftTime: any) {
    return this.getPollDraft()
      .then((allDraft) => allDraft.filter((d) => d.time !== draftTime))
      .then((allDraft) => this.savePollDraft(allDraft))
      .catch((err) => {});
  }
  savePollDraft(value: any) {
    return this.localStorage.setLocalStorage(storageKeys.pollDraft, value);
  }

  getPollDraft() {
    return this.localStorage
      .getLocalStorage(storageKeys.pollDraft)
      .then((items) => {
        return items;
      })
      .catch(() => {
        this.localStorage.setLocalStorage(storageKeys.pollDraft, []);
        return [];
      });
  }

  getPollMetaField() {
    const url = AppConfigs.poll.pollMetaForm;
    return new Promise((resolve, reject) => {
      this.apiService.httpGet(
        url,
        (successData) => {
          resolve(successData.result);
        },
        () => {
          reject();
        }
      );
    });
  }

  sharePoll(body) {
    const url = AppConfigs.poll.sharePoll;
    return new Promise((resolve, reject) => {
      this.apiService.httpPost(
        url,
        body,
        (successData) => {
          resolve(successData.result);
        },
        () => {
          reject();
        }
      );
    });
  }
}
