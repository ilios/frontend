import Controller from '@ember/controller';
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
  @tracked applicationError;
  existingErrorHandler = null;

  appVersion = new TrackedAsyncData(this.iliosConfig.getAppVersion());

  constructor() {
    super(...arguments);
    // Remove the render global listener so application errors will show up in Ilios
    window.removeEventListener('error', window.runtimeRenderErrorListener);
    window.addEventListener('error', (event) => {
      this.error(event.error);
    });
  }

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

  error = (error) => {
    this.applicationError = error;
    console.error(error.message);
    if (this.existingErrorHandler) {
      this.existingErrorHandler(error);
    }
  };
}
