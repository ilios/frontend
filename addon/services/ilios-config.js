import Service, { inject as service } from '@ember/service';

export default class IliosConfigService extends Service {
  @service fetch;
  @service serverVariables;
  _configPromise = null;

  async getConfig() {
    if (!this._configPromise) {
      this._configPromise = this.fetch.getJsonFromApiHost('/application/config');
    }
    const config = await this._configPromise;
    return config;
  }

  async itemFromConfig(key) {
    const config = await this.getConfig();
    const obj = config.config;
    return key in obj ? obj[key] : null;
  }

  async getUserSearchType() {
    return this.itemFromConfig('userSearchType');
  }

  async getAuthenticationType() {
    return this.itemFromConfig('type');
  }

  async getMaxUploadSize() {
    return this.itemFromConfig('maxUploadSize');
  }

  async getApiVersion() {
    return this.itemFromConfig('apiVersion');
  }

  async getTrackingEnabled() {
    return this.itemFromConfig('trackingEnabled');
  }

  async getTrackingCode() {
    return this.itemFromConfig('trackingCode');
  }

  async getLoginUrl() {
    return this.itemFromConfig('loginUrl');
  }

  async getCasLoginUrl() {
    return this.itemFromConfig('casLoginUrl');
  }

  get apiNameSpace() {
    const apiNameSpace = this.serverVariables.get('apiNameSpace');
    if (apiNameSpace) {
      //remove trailing slashes
      return apiNameSpace.replace(/\/+$/, '');
    }
    return '';
  }

  get apiHost() {
    const apiHost = this.serverVariables.get('apiHost');
    if (apiHost) {
      //remove trailing slashes
      return apiHost.replace(/\/+$/, '');
    }
    return '';
  }

  get errorCaptureEnabled() {
    const errorCaptureEnabled = this.serverVariables.get('errorCaptureEnabled');
    if (typeof errorCaptureEnabled === 'boolean') {
      return errorCaptureEnabled;
    }

    return errorCaptureEnabled === 'true';
  }

  async getSearchEnabled() {
    const searchEnabled = await this.itemFromConfig('searchEnabled');
    if (searchEnabled === null) {
      return false;
    }
    if (typeof searchEnabled === 'boolean') {
      return searchEnabled;
    }

    return searchEnabled === 'true';
  }
}
