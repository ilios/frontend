import Ember from 'ember';
import ENV from 'ilios/config/environment';

const { Component, RSVP, computed} = Ember;
const { Promise } = RSVP;

const { apiVersion } = ENV.APP;

export default Component.extend({
  iliosConfig: Ember.inject.service(),
  versionMismatch: computed('iliosConfig.apiVersion', function(){
    const iliosConfig = this.get('iliosConfig');
    return new Promise(resolve => {
      iliosConfig.get('apiVersion').then(serverApiVersion => {
        resolve(serverApiVersion !== apiVersion);
      });
    });
  }),
});
