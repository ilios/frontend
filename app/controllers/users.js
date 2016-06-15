import Ember from 'ember';
import config from '../config/environment';
import { cleanQuery } from '../utils/query-utils';

const { computed, Controller, inject, run, RSVP } = Ember;
const { service } = inject;
const { debounce } = run;
const { IliosFeatures: { allowAddNewUser } } = config;
const { Promise } = RSVP;

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
  query: '',
  allowAddNewUser: allowAddNewUser,
  showNewUserForm: false,
  showBulkNewUserForm: false,
  searchTerms: null,

  delay: 500,

  users: computed('query', 'offset', 'limit', {
    get() {
      const q = cleanQuery(this.get('query'));
      const { school, offset, limit } = this.getProperties('school', 'offset', 'limit');
      return this.get('store').query('user', {
        school, limit, q, offset,
        'order_by[lastName]': 'ASC',
        'order_by[firstName]': 'ASC'
      })
    }
  }).readOnly(),

  newUserComponent: computed('iliosConfig.userSearchType', function(){
    return new Promise(resolve => {
      this.get('iliosConfig.userSearchType').then(userSearchType => {
        let component = userSearchType === 'ldap'?'new-directory-user':'new-user';
        resolve(component);
      });
    });
  }),

  newBulkUserComponent: computed('iliosConfig.userSearchType', function(){
    return new Promise(resolve => {
      this.get('iliosConfig.userSearchType').then(userSearchType => {
        let component = userSearchType === 'ldap'?'bulk-new-directory-users':'bulk-new-users';
        resolve(component);
      });
    });
  }),

  _updateQuery(value) {
    if(value !== this.get('query')){
      this.set('offset', 0);
    }
    this.set('query', value);
  },

  actions: {
    changeQuery(value) {
      debounce(this, this._updateQuery, value, this.get('delay'));
    },
    transitionToUser(userId){
      this.transitionToRoute('user', userId);
    }
  }
});
