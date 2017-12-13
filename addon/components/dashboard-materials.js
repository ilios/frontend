import Ember from 'ember';
import layout from '../templates/components/dashboard-materials';
import moment from 'moment';

const { Component, computed } = Ember;
const { reads } = computed;

export default Component.extend({
  layout,
  currentUser: Ember.inject.service(),
  commonAjax: Ember.inject.service(),
  iliosConfig: Ember.inject.service(),
  daysInAdvance: 60,

  namespace: reads('iliosConfig.apiNameSpace'),

  classNames: ['dashboard-materials'],

  materials: computed('currentUser.currentUserId', async function() {
    const from = moment().hour(0).minute(0).unix();
    const to = moment().hour(23).minute(59).add(this.daysInAdvance, 'days').unix();
    const commonAjax = this.get('commonAjax');
    const currentUser = this.get('currentUser');
    const namespace = this.get('namespace');

    const userId = currentUser.get('currentUserId');
    let url = `${namespace}/usermaterials/${userId}?before=${to}&after=${from}`;
    const data = await commonAjax.request(url);
    return data.userMaterials;
  }),
  actions: {
    sortString(a, b){
      return a.localeCompare(b);
    }
  }
});
