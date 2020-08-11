import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import * as jwt_decode from "jwt-decode";
import { AppIconBadgeProvider } from '../app-icon-badge/app-icon-badge';
import { LocalStorageProvider } from '../local-storage/local-storage';

// import { SQLite, SQLiteObject } from '@ionic-native/sqlite';

/*
  Generated class for the CurrentUserProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class CurrentUserProvider {

  public curretUser: any;

  constructor(private storage: Storage, private appBadge: AppIconBadgeProvider, private localStorage: LocalStorageProvider) {
    console.log('Hello CurrentUserProvider Provider');
  }

  setCurrentUserDetails(userTokens): Promise<any> {
    // let userDetails = jwt_decode(userTokens.accessToken);
    // let userId = userDetails.sub;
    // this.sqlite.create({
    //   name: userId+'.db',
    //   location: 'default'
    // }).then((db: SQLiteObject) => {
    //     db.executeSql('CREATE TABLE IF NOT EXIST session(rowId INTEGER PRIMARY KEY, idToken TEXT, accessToken TEXT, refreshToken TEXT)')
    //       .then(() => {
    //         db.executeSql('INSERT INTO session (idToken, accessToken, refreshToken) VALUES (userDetails.idToken, userDetails.accessToken, userDetails.refreshToken)')
    //         .then(()=>{
    //           console.log("user data added");
    //         })
    //       })
    //       .catch(e => console.log(e));
    //   })
    //   .catch(e => console.log(e));
    return new Promise((resolve, reject) => {
      this.curretUser = userTokens;
      this.storage.set('tokens', JSON.stringify(userTokens)).then(success => {
        resolve()
      }).catch(error => {
      });
    })

  }

  getCurrentUserData(): any {
    const currentUser = this.curretUser ? jwt_decode(this.curretUser.accessToken) : null
    return currentUser
  }

  getDecodedAccessToken(token) {
    return jwt_decode(token);
  }

  removeUser(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.storage.clear().then(success => {
        this.appBadge.clearTheBadge();
        this.curretUser = "";
        resolve();
      }).catch(error => {
        reject();
      })
    })
  }

  fetchUser(): void {
    this.storage.get('tokens').then((session) => {
      this.curretUser = JSON.parse(session);
      return JSON.parse(session)
    });
  }

  deactivateActivateSession(status): void {
    this.curretUser.isDeactivated = status;
    this.setCurrentUserDetails(this.curretUser);
  }

  checkForTokens(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.storage.get('tokens').then((tokens) => {
        console.log("heree")
        if (tokens) {
          this.curretUser = JSON.parse(tokens);
          resolve(this.curretUser);
        } else {
          reject(this.curretUser);
        }
      });
    })
  }

  checkForValidToken(): Promise<any> {
    console.log('check for token')
    return new Promise((resolve, reject) => {
      this.storage.get('tokens').then((tokens) => {
        console.log("check token promise" + tokens);
        if (tokens) {
          console.log('in if token');
          let current_tokens = JSON.parse(tokens);
          let access_token = jwt_decode(current_tokens.accessToken);
          let access_token_expire_time = parseInt(access_token.exp);
          console.log(access_token_expire_time + ' ' + Date.now() + ' ' + (access_token_expire_time > Date.now()));
          if (access_token_expire_time > (Date.now() / 1000)) {
            resolve("Valid token")
          } else {
            console.log("invalid Valid token");
            reject("Problem authenticating with Sunbird");
          }
        } else {
          console.log("no token");
          reject("Problem authenticating with Sunbird");
        }
        // this.curretUser = JSON.parse(session);
        // return JSON.parse(session)
      });

    });
  }

  refreshToken() {

  }

  getCurrentUserEntities(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.localStorage.getLocalStorage('profileRole').then(success => {
        console.log(JSON.stringify(success))
        resolve(success ? success.entities : null)
      }).catch(error => {
        reject(null)
      })
    })

  }
}
