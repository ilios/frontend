import Service from '@ember/service';
import { getOwner } from '@ember/application';
import { getValueFromHtml } from 'ilios-common/utils/html-server-variables';

export default class ServerVariablesService extends Service {
  get config() {
    return getOwner(this).resolveRegistration('config:environment');
  }

  get apiNameSpace() {
    if (this.config.apiNameSpace) {
      return this.config.apiNameSpace;
    }

    if (getValueFromHtml('api-name-space')) {
      return getValueFromHtml('api-name-space');
    }

    return '';
  }

  get apiHost() {
    if (this.config.apiHost) {
      return this.config.apiHost;
    }

    if (getValueFromHtml('api-host')) {
      return getValueFromHtml('api-host');
    }

    return '';
  }

  get errorCaptureEnabled() {
    if (this.config.errorCaptureEnabled) {
      return this.config.errorCaptureEnabled;
    }

    if (getValueFromHtml('error-capture-enabled')) {
      return getValueFromHtml('error-capture-enabled');
    }

    return this.config.environment === 'production';
  }

  get errorCaptureEnvironment() {
    if (this.config.errorCaptureEnvironment) {
      return this.config.errorCaptureEnvironment;
    }

    if (getValueFromHtml('error-capture-environment')) {
      return getValueFromHtml('error-capture-environment');
    }

    return this.config.environment;
  }
}
