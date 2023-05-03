import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
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

  @cached
  get appVersionData() {
    return new TrackedAsyncData(this.iliosConfig.getAppVersion());
  }

  get appVersion() {
    return this.appVersionData.isResolved ? this.appVersionData.value : null;
  }

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
    this.errors = [...this.errors, error];
    this.showErrorDisplay = true;
  }
}
