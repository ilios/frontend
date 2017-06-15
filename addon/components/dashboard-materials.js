import Ember from 'ember';
import layout from '../templates/components/dashboard-materials';
import moment from 'moment';

const { Component, RSVP, computed, inject } = Ember;
const { service }= inject;
const { reads } = computed;
const { Promise } = RSVP;

export default Component.extend({
  layout,
  currentUser: service(),
  commonAjax: service(),
  iliosConfig: service(),
  daysInAdvance: 60,

  namespace: reads('iliosConfig.apiNameSpace'),

  classNames: ['dashboard-materials'],

  materials: computed('currentUser.currentUserId', function() {
    const from = moment().hour(0).minute(0).unix();
    const to = moment().hour(23).minute(59).add(this.daysInAdvance, 'days').unix();
    const commonAjax = this.get('commonAjax');
    const currentUser = this.get('currentUser');
    const namespace = this.get('namespace');

    return new Promise(resolve => {
      const userId = currentUser.get('currentUserId');
      let url = `${namespace}/usermaterials/${userId}?before=${to}&after=${from}`;
      commonAjax.request(url).then(data => {
        resolve(data.userMaterials);
      });
    });
  }),
  actions: {
    sortString(a, b){
      return a.localeCompare(b);
    }
  }
});
