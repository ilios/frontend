import Service, { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { isPresent } from '@ember/utils';

export default Service.extend({
  fetch: service(),
  serverVariables: service(),
  _configPromise: null,
  async getConfig() {
    if (!this._configPromise) {
      this._configPromise = this.fetch.getJsonFromApiHost('/application/config');
    }
    const config = await this._configPromise;
    return config;
  },

  async itemFromConfig(key) {
    const config = await this.getConfig();
    const obj = config.config;
    return key in obj ? obj[key] : null;
  },

  async getUserSearchType() {
    return this.itemFromConfig('userSearchType');
  },

  async getAuthenticationType() {
    return this.itemFromConfig('type');
  },

  async getMaxUploadSize() {
    return this.itemFromConfig('maxUploadSize');
  },

  async getApiVersion() {
    return this.itemFromConfig('apiVersion');
  },

  async getTrackingEnabled() {
    return this.itemFromConfig('trackingEnabled');
  },

  async getTrackingCode() {
    return this.itemFromConfig('trackingCode');
  },

  async getLoginUrl() {
    return this.itemFromConfig('loginUrl');
  },

  async getCasLoginUrl() {
    return this.itemFromConfig('casLoginUrl');
  },

  apiNameSpace: computed('serverVariables.apiNameSpace', function () {
    const serverVariables = this.serverVariables;
    const apiNameSpace = serverVariables.get('apiNameSpace');
    if (isPresent(apiNameSpace)) {
      //remove trailing slashes
      return apiNameSpace.replace(/\/+$/, '');
    }
    return '';
  }),

  apiHost: computed('serverVariables.apiHost', function () {
    const serverVariables = this.serverVariables;
    const apiHost = serverVariables.get('apiHost');
    if (isPresent(apiHost)) {
      //remove trailing slashes
      return apiHost.replace(/\/+$/, '');
    }
    return '';
  }),

  errorCaptureEnabled: computed('serverVariables.errorCaptureEnabled', function () {
    const serverVariables = this.serverVariables;
    const errorCaptureEnabled = serverVariables.get('errorCaptureEnabled');
    if (typeof errorCaptureEnabled === 'boolean') {
      return errorCaptureEnabled;
    }

    return errorCaptureEnabled === 'true';
  }),

  async getSearchEnabled() {
    const searchEnabled = await this.itemFromConfig('searchEnabled');
    if (searchEnabled === null) {
      return false;
    }
    if (typeof searchEnabled === 'boolean') {
      return searchEnabled;
    }

    return searchEnabled === 'true';
  },
});
