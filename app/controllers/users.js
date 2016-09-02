import Ember from 'ember';
import config from '../config/environment';
import { cleanQuery } from '../utils/query-utils';
import { task, timeout } from 'ember-concurrency';

const { computed, Controller, inject, RSVP } = Ember;
const { service } = inject;
const { IliosFeatures: { allowAddNewUser } } = config;
const { Promise } = RSVP;

const DEBOUNCE_TIMEOUT = 250;

export default Controller.extend({
  store: service(),
  iliosConfig: service(),
  queryParams: {
    offset: 'offset',
    limit: 'limit',
    query: 'filter',
    showNewUserForm: 'addUser',
    showBulkNewUserForm: 'addUsers',
    searchTerms: 'search'
  },
  offset: 0,
  limit: 25,
  query: null,
  allowAddNewUser: allowAddNewUser,
  showNewUserForm: false,
  showBulkNewUserForm: false,
  searchTerms: null,

  searchForUsers: task(function * (){
    const query = this.get('query');
    const q = cleanQuery(query);
    yield timeout(DEBOUNCE_TIMEOUT);
    const { school, offset, limit } = this.getProperties('school', 'offset', 'limit');
    return yield this.get('store').query('user', {
      school, limit, q, offset,
      'order_by[lastName]': 'ASC',
      'order_by[firstName]': 'ASC'
    });

  }).cancelOn('deactivate').restartable(),

  newUserComponent: computed('iliosConfig.userSearchType', function(){
    return new Promise(resolve => {
      this.get('iliosConfig.userSearchType').then(userSearchType => {
        let component = userSearchType === 'ldap'?'new-directory-user':'new-user';
        resolve(component);
      });
    });
  }),

  actions: {
    transitionToUser(userId){
      this.transitionToRoute('user', userId);
    },
    setOffset(offset){
      if (offset < 0) {
        offset = 0;
      }
      this.set('offset', offset);
      this.get('searchForUsers').perform();
    },
    setLimit(limit){
      this.set('limit', limit);
      this.get('searchForUsers').perform();
    },
    setQuery(query){
      this.set('query', query);
      this.get('searchForUsers').perform();
    }
  }
});
