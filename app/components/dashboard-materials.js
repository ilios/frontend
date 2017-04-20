import moment from 'moment';
import Ember from 'ember';

const { Component, RSVP, computed, inject } = Ember;
const { service } = inject;
const { reads } = computed;
const { Promise } = RSVP;

export default Component.extend({
  currentUser: service(),
  ajax: service(),
  iliosConfig: service(),
  daysInAdvance: 60,

  host: reads('iliosConfig.apiHost'),
  namespace: reads('iliosConfig.apiNameSpace'),

  classNames: ['dashboard-materials'],

  materials: computed('currentUser.currentUserId', function() {
    const from = moment().hour(0).minute(0).unix();
    const to = moment().hour(23).minute(59).add(this.daysInAdvance, 'days').unix();
    const ajax = this.get('ajax');
    const host = this.get('host');
    const currentUser = this.get('currentUser');
    const namespace = this.get('namespace');

    return new Promise(resolve => {
      const userId = currentUser.get('currentUserId');
      let url = `${host}/${namespace}/usermaterials/${userId}?before=${to}&after=${from}`;
      ajax.request(url).then(data => {
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
