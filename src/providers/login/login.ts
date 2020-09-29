import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as qs from 'qs';
import { WebviewRunnerProvider } from '../webview-runner/webview-runner';
import { HTTP } from "@ionic-native/http";
import { AppConfigs } from '../appConfig';
import { AuthProvider } from '../auth/auth';
import { UtilsProvider } from '../utils/utils';
import { AppVersion } from '@ionic-native/app-version';

declare const cordova;
interface ParamMap { [key: string]: string; }

@Injectable()
export class LoginProvider {

  loginForm;
  inAppBrowser;
  loginConfig;
  private resetParams: ParamMap | undefined;
  appId;

  constructor(
    public http: HttpClient, private webRunner: WebviewRunnerProvider,
    private ionHttp: HTTP,
    private auth: AuthProvider,
    private utils: UtilsProvider,
    private appVer: AppVersion
  ) {
    console.log('Hello LoginProvider Provider');
    this.appVer.getPackageName().then(id => {
      this.appId = id;
    })
  }

  buildUrl(host: string, path: string, params) {
    // console.log(`${host}${path}?${qs.stringify(params)}`)
    let url = `${host}${path}?`;
    for (const param of params) {
      url = url + `${param.key}=${param.value}&`
    }
    url = url.slice(0, -1)
    console.log(url);
    return url;
  }

  getFormApi() {
    const url = AppConfigs.app_url + "/api/data/v1/form/read";
    this.ionHttp.setDataSerializer('json');
    const payload = {
      "request": {
        "type": "config",
        "action": "get",
        "subType": "login",
      }
    }
    this.utils.startLoader()
    this.ionHttp.post(url, payload, {}).then(success => {
      this.utils.stopLoader();
      this.loginForm = (success && success.data) ? JSON.parse(success.data) : {};
      this.getWebviewSessionProviderConfig('login');
    }).catch(error => {
      this.utils.stopLoader();
      this.utils.openToast("Error occured");
    })
  }

  getWebviewSessionProviderConfig(context: 'login') {
    const config = this.loginForm['result']['form']['data']['fields'].find(c => c.context === context);
    this.loginConfig = config;
    this.provide();
  }

  public resetInAppBrowserEventListeners() {
    debugger
    for (const key in this.inAppBrowser.listeners) {
      if (this.inAppBrowser.listeners.hasOwnProperty(key)) {
        (this.inAppBrowser.listeners[key] as Set<any>).forEach((listener) => {
          this.inAppBrowser!.ref.removeEventListener(key as any, listener);
        });
        (this.inAppBrowser.listeners[key] as Set<any>).clear();
      }
    }
  }


  public async provide() {
    const dsl = this.webRunner;
    const config = {
      host: this.loginConfig.target.host,
      path: this.loginConfig.target.path,
      params: this.loginConfig.target.params.reduce((acc, p) => {
        acc[p.key] = p.value;
        return acc;
      }, { ...this.resetParams })
    }
    return dsl.launchWebview(config).then(() => {
      return dsl.any<any>(
        ...this.loginConfig.return.reduce((acc, forCase) => {
          switch (forCase.type) {
            case 'password': acc.push(
              this.buildPasswordSessionProvider(dsl, forCase)
            ); break;

            case 'state': acc.push(
              this.buildStateSessionProvider(dsl, forCase)
            ); break;
            case 'state-error': acc.push(dsl.capture({
              host: forCase.when.host,
              path: forCase.when.path,
              params: forCase.when.params
            }).then(() => {
              return dsl.closeWebview().then(() => {
                return dsl.resolveCaptured('error_message').catch(() => {
                  this.utils.openToast('error_message');
                }).then((param) => {
                  this.utils.openToast(`Error param`);
                });
              });
            })); break;

            case 'google': acc.push(
              this.buildGoogleSessionProvider(dsl, forCase)
            ); break;

            case 'reset': acc.push(dsl.capture({
              host: forCase.when.host,
              path: forCase.when.path,
              params: [
                ...forCase.when.params,
                {
                  key: 'client_id',
                  resolveTo: 'client_id',
                  match: 'portal'
                },
                {
                  key: 'automerge',
                  resolveTo: 'automerge',
                  exists: 'false'
                }
              ]
            }).then(() =>
              dsl.getCaptureExtras().then((extras) => {
                this.resetParams = extras;

                return dsl.closeWebview().then(() =>
                  new Promise((resolve) => setTimeout(resolve, 500))
                    .then(() => this.provide())
                );
              })
            )); break;
          }
          return acc;
        }, [])

      )
    })
  }

  protected buildStateSessionProvider(dsl, forCase) {
    return dsl.capture({
      host: forCase.when.host,
      path: forCase.when.path,
      params: forCase.when.params
    }).then(() => dsl.closeWebview()).then(() => dsl.success()).then((captured) => {
      return this.resolveStateSession(captured);
    });
  }

  protected buildPasswordSessionProvider(dsl, forCase) {
    return dsl.capture({
      host: forCase.when.host,
      path: forCase.when.path,
      params: forCase.when.params
    }).then(() => {
      return dsl.closeWebview()
    }
    ).then(() => {
      return dsl.success()
    }
    ).then((captured) => {
      return this.resolvePasswordSession(captured);
    });
  }

  protected buildGoogleSessionProvider(dsl, forCase) {
    return dsl.capture({
      host: forCase.when.host,
      path: forCase.when.path,
      params: forCase.when.params
    }).then(() =>
      dsl.closeWebview()
    ).then(() =>
      dsl.success()
    ).then((captured) =>
      dsl.getCaptureExtras().then((extras) => {
        const url = this.buildGoogleTargetUrl(captured, extras);
        return dsl.launchCustomTab({
          host: url.origin,
          path: url.pathname,
          params: qs.parse(url.searchParams.toString(), { ignoreQueryPrefix: true })
        }).then(() => {
          return dsl.success()
        }
        ).then((cap) => {
          this.utils.startLoader();
          return this.resolveGoogleSession(cap);
        });
      })
    );
  }

  private resolveGoogleSession(captured: { [key: string]: string }) {
    if ((captured[`${this.appId}://mobile?access_token`] || captured['access_token']) && captured['refresh_token']) {
      const tokens = {
        access_token: captured[`${this.appId}://mobile?access_token`] || captured['access_token'],
        refresh_token: captured['refresh_token'],
      };
        this.auth.checkForCurrentUserLocalData(tokens);
        this.utils.stopLoader();
    } else if (captured['error_message']) {
      this.utils.openToast(captured['error_message']);
    }
  }

  setUserDetails(): Promise<any> {
    return new Promise((resolve, reject) => {

    })
  }

  protected buildGoogleTargetUrl(captured: { [key: string]: string }, extras: { [key: string]: string }): URL {
    const url = new URL(captured['googleRedirectUrl']);
    delete extras['redirect_uri'];
    url.searchParams.set('redirect_uri', this.appId + '://mobile');
    delete extras['error_callback'];
    url.searchParams.set('error_callback', this.appId + '://mobile');
    Object.keys(extras).forEach(key => url.searchParams.set(key, extras[key]));
    return url;
  }

  private resolveStateSession(captured) {
    this.utils.startLoader();
    const url = AppConfigs.app_url + `/v1/sso/create/session?id=${captured['id']}`;
    this.ionHttp.get(url, {}, {}).then(response => {
      this.utils.startLoader();
      const obj = response.data ? JSON.parse(response.data) : null;
      if (obj.access_token && obj.refresh_token) {
        const tokens = {
          access_token: obj.access_token,
          refresh_token: obj.refresh_token,
        }
        this.auth.checkForCurrentUserLocalData(tokens);
      } else {
        this.utils.openToast("Something went wrong");
      }
    }).catch(error => {
      this.utils.startLoader();

      this.utils.openToast(captured['error_message']);
    })
  }


  private resolvePasswordSession(captured: { [key: string]: string }) {
    this.utils.startLoader();
    this.ionHttp.setDataSerializer("urlencoded");
    const obj = {
      redirect_uri: AppConfigs.app_url + '/oauth2callback',
      code: captured['code'],
      grant_type: 'authorization_code',
      client_id: 'android'
    };
    const url = AppConfigs.app_url + AppConfigs.keyCloak.getAccessToken;
    this.ionHttp.post(url, obj, {}).then(success => {
      this.utils.stopLoader();
      const tokens = JSON.parse(success.data)
      this.auth.checkForCurrentUserLocalData(tokens);
      console.log(success)
    }).catch(error => {
      this.utils.stopLoader();
      this.utils.openToast("Something went wrong")
    })
  }
}
