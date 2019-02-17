import RavenService from 'ember-cli-sentry/services/raven';
import { inject as service } from '@ember/service';
import config from '../config/environment';
import { versionRegExp } from 'ember-cli-app-version/utils/regexp';

export default RavenService.extend({
  iliosConfig: service(),

  /**
   * Override default service to add configuration check
   * before attempting to capture anything.
   */
  ignoreError() {
    return !this.iliosConfig.errorCaptureEnabled;
  },

  release: config.APP.version.match(versionRegExp),
});
