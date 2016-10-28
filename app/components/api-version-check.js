import Ember from 'ember';
import ENV from 'ilios/config/environment';

const { Component, RSVP, computed, inject } = Ember;
const { Promise } = RSVP;
const { service } = inject;

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
