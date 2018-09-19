/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { cleanQuery } from '../utils/query-utils';
import { task, timeout } from 'ember-concurrency';

const DEBOUNCE_TIMEOUT = 250;

export default Component.extend({
  store: service(),
  iliosConfig: service(),
  classNames: ['ilios-users'],
  offset: null,
  limit: null,
  query: null,
  showNewUserForm: false,
  showBulkNewUserForm: false,

  didReceiveAttrs(){
    this._super(...arguments);
    this.searchForUsers.perform();
  },

  searchForUsers: task(function * (){
    const query = this.query;
    const q = cleanQuery(query);
    yield timeout(DEBOUNCE_TIMEOUT);
    const { store, offset, limit } = this;
    return yield store.query('user', {
      limit, q, offset,
      'order_by[lastName]': 'ASC',
      'order_by[firstName]': 'ASC'
    });

  }).cancelOn('deactivate').restartable(),

  newUserComponent: computed('iliosConfig.userSearchType', async function(){
    const iliosConfig = this.iliosConfig;
    const userSearchType = await iliosConfig.get('userSearchType');

    return userSearchType === 'ldap'?'new-directory-user':'new-user';
  }),

  actions: {
    setOffset(offset){
      if (offset < 0) {
        offset = 0;
      }
      this.setOffset(offset);
    },
  }
});
