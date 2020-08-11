import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Storage } from "@ionic/storage";

@Injectable()
export class LocalStorageProvider {
  constructor(public http: HttpClient, private storage: Storage) {
    console.log("Hello LocalStorageProvider Provider");
  }

  setLocalStorage(key, value): Promise<any> {
    return new Promise((resolve, reject) => {
      this.storage
        .set(key, value)
        .then((success) => {
          resolve();
        })
        .catch((error) => {
          reject();
        });
    });
  }

  getLocalStorage(key): Promise<any> {
    // console.log(key)
    return new Promise((resolve, reject) => {
      this.storage
        .get(key)
        .then((data) => {
          // console.log(data)
          if (data) {
            resolve(data);
          } else {
            reject(null);
          }
          // resolve(data)
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  deleteAllStorage(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.storage
        .clear()
        .then((data) => {
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  deleteOneStorage(key): Promise<any> {
    return new Promise((resolve, reject) => {
      this.storage
        .remove(key)
        .then((data) => {
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}
