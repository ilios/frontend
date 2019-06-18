import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { cleanQuery } from 'ilios-common/utils/query-utils';
import { task, timeout } from 'ember-concurrency';

const DEBOUNCE_TIMEOUT = 250;

export default Component.extend({
  iliosConfig: service(),
  store: service(),

  classNames: ['ilios-users'],

  limit: null,
  offset: null,
  query: null,
  showBulkNewUserForm: false,
  showNewUserForm: false,

  newUserComponent: computed('iliosConfig.userSearchType', async function() {
    const iliosConfig = this.iliosConfig;
    const userSearchType = await iliosConfig.get('userSearchType');
    return userSearchType === 'ldap'?'new-directory-user':'new-user';
  }),

  searchForUsers: task(function* () {
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

  didReceiveAttrs() {
    this._super(...arguments);
    this.searchForUsers.perform();
  },

  actions: {
    setOffset(offset) {
      if (offset < 0) {
        offset = 0;
      }
      this.setOffset(offset);
    }
  }
});
