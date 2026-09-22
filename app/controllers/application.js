import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import config from 'frontend/config/environment';

export default class ApplicationController extends Controller {
  @service apiVersion;
  @service currentUser;
  @service intl;
  @service session;
  @service iliosConfig;

  @tracked currentlyLoading = false;
  @tracked errors = [];
  @tracked showErrorDisplay = false;

  appVersion = new TrackedAsyncData(this.iliosConfig.getAppVersion());

  @cached
  get iliosVersionTag() {
    if (this.appVersion.isResolved) {
      return `v${this.appVersion.value}`;
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
    return `Frontend: v${config.APP.VERSION}`;
  }

  get useFullLayout() {
    // user authorized for LTI usage do not get to see the full layout.
    return !this.currentUser.isLtiUser;
  }

  get hasNavigation() {
    return this.currentUser.performsNonLearnerFunction && this.useFullLayout;
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
