import RavenService from 'ember-cli-sentry/services/raven';
import { inject as service } from '@ember/service';

export default RavenService.extend({
  iliosConfig: service(),

  /**
   * Override default service to add configuration check
   * before attempting to capture anything.
   */
  ignoreError(){
    return !this.iliosConfig.errorCaptureEnabled;
  },
});
