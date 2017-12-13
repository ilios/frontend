import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from '../templates/components/dashboard-materials';
import moment from 'moment';

const { reads } = computed;

export default Component.extend({
  layout,
  currentUser: service(),
  commonAjax: service(),
  iliosConfig: service(),
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
