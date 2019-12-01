import Service, { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { isPresent } from '@ember/utils';

export default Service.extend({
  fetch: service(),
  serverVariables: service(),
  _config: null,

  config: computed('apiHost', function () {
    return this.getConfig();
  }),
  async getConfig() {
    if (!this._config) {
      this._config = await this.fetch.getJsonFromApiHost('/application/config');
    }
    return this._config;
  },

  async itemFromConfig(key) {
    const config = await this.getConfig();
    const obj = config.config;
    return key in obj?obj[key]:null;
  },

  userSearchType: computed('config.userSearchType', function(){
    return this.getUserSearchType();
  }),
  async getUserSearchType() {
    return this.itemFromConfig('userSearchType');
  },

  authenticationType: computed('config.type', function(){
    return this.getUserSearchType();
  }),
  async getAuthenticationType() {
    return this.itemFromConfig('type');
  },

  maxUploadSize: computed('config.maxUploadSize', function(){
    return this.getMaxUploadSize();
  }),
  async getMaxUploadSize() {
    return this.itemFromConfig('maxUploadSize');
  },

  apiVersion: computed('config.apiVersion', function(){
    return this.getApiVersion();
  }),
  async getApiVersion() {
    return this.itemFromConfig('apiVersion');
  },

  trackingEnabled: computed('config.trackingEnabled', function(){
    return this.getTrackingEnabled();
  }),
  async getTrackingEnabled() {
    return this.itemFromConfig('trackingEnabled');
  },

  trackingCode: computed('config.trackingCode', function(){
    return this.getTrackingCode();
  }),
  async getTrackingCode() {
    return this.itemFromConfig('trackingCode');
  },

  loginUrl: computed('config.loginUrl', function(){
    return this.getLoginUrl();
  }),
  async getLoginUrl() {
    return this.itemFromConfig('loginUrl');
  },

  casLoginUrl: computed('config.casLoginUrl', function(){
    return this.getCasLoginUrl();
  }),
  async getCasLoginUrl() {
    return this.itemFromConfig('casLoginUrl');
  },

  apiNameSpace: computed('serverVariables.apiNameSpace', function(){
    const serverVariables = this.get('serverVariables');
    const apiNameSpace = serverVariables.get('apiNameSpace');
    if (isPresent(apiNameSpace)) {
      //remove trailing slashes
      return apiNameSpace.replace(/\/+$/, "");
    }
    return '';
  }),

  apiHost: computed('serverVariables.apiHost', function(){
    const serverVariables = this.get('serverVariables');
    const apiHost = serverVariables.get('apiHost');
    if (isPresent(apiHost)) {
      //remove trailing slashes
      return apiHost.replace(/\/+$/, "");
    }
    return '';
  }),

  errorCaptureEnabled: computed('serverVariables.errorCaptureEnabled', function(){
    const serverVariables = this.get('serverVariables');
    const errorCaptureEnabled = serverVariables.get('errorCaptureEnabled');
    if (typeof errorCaptureEnabled === 'boolean') {
      return errorCaptureEnabled;
    }

    return errorCaptureEnabled === 'true';
  }),

  searchEnabled: computed('config.searchEnabled', async function(){
    return this.getSearchEnabled();
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
