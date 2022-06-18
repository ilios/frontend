import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import { appVersion } from 'ilios/helpers/app-version';

export default class ApplicationController extends Controller {
  @service apiVersion;
  @service currentUser;
  @service intl;
  @service session;
  @service iliosConfig;

  @tracked currentlyLoading = false;
  @tracked errors = [];
  @tracked showErrorDisplay = false;

  @use appVersion = new ResolveAsyncValue(() => [this.iliosConfig.getAppVersion()]);

  get iliosVersionTag() {
    if (this.appVersion) {
      return `v${this.appVersion}`;
    }

    return '';
  }

  get apiVersionTag() {
    if (this.apiVersion.version) {
      return `API: ${this.apiVersion.version}`;
    }

    return '';
  }

  get frontendVersionTag() {
    const version = appVersion(null, { versionOnly: true });
    if (version) {
      return `Frontend: v${version}`;
    }

    return '';
  }

  @action
  clearErrors() {
    this.errors = [];
    this.showErrorDisplay = false;
  }

  @action
  addError(error) {
    this.errors.pushObject(error);
    this.showErrorDisplay = true;
  }
}
