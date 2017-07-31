import { inject as service } from '@ember/service';
import Component from '@ember/component';
import RSVP from 'rsvp';
import { computed } from '@ember/object';
import ENV from 'ilios/config/environment';

const { Promise } = RSVP;

const { apiVersion } = ENV.APP;

export default Component.extend({
  iliosConfig: service(),
  versionMismatch: computed('iliosConfig.apiVersion', function(){
    const iliosConfig = this.get('iliosConfig');
    return new Promise(resolve => {
      iliosConfig.get('apiVersion').then(serverApiVersion => {
        resolve(serverApiVersion !== apiVersion);
      });
    });
  }),
});
