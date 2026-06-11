import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { appVersion } from 'frontend/helpers/app-version';

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

  ltiApplicationScopes = ['lti-dashboard', 'lti-course-manager'];

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
    const version = appVersion(null, { versionOnly: true });
    if (version) {
      return `Frontend: v${version}`;
    }

    return '';
  }

  get useFullLayout() {
    // user authorized for LTI usage do not get to see the full layout.
    return !this.currentUser.applicationScopes.some((scope) =>
      this.ltiApplicationScopes.includes(scope),
    );
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
