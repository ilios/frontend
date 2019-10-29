import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from '../templates/components/dashboard-materials';
import moment from 'moment';

const { reads } = computed;

export default Component.extend({
  currentUser: service(),
  fetch: service(),
  iliosConfig: service(),
  layout,
  daysInAdvance: 60,

  classNames: ['dashboard-materials'],

  namespace: reads('iliosConfig.apiNameSpace'),

  materials: computed('currentUser.currentUserId', async function() {
    const from = moment().hour(0).minute(0).unix();
    const to = moment().hour(23).minute(59).add(this.daysInAdvance, 'days').unix();
    const currentUser = this.get('currentUser');
    const namespace = this.get('namespace');

    const userId = currentUser.get('currentUserId');
    let url = `${namespace}/usermaterials/${userId}?before=${to}&after=${from}`;
    const data = await this.fetch.getJsonFromApiHost(url);
    return data.userMaterials;
  }),
  actions: {
    sortString(a, b){
      return a.localeCompare(b);
    }
  }
});
