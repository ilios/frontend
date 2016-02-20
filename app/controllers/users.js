import Ember from 'ember';
import config from '../config/environment';
import { cleanQuery } from '../utils/query-utils';

const { computed, Controller, inject, run } = Ember;
const { service } = inject;
const { debounce } = run;
const { IliosFeatures: { allowAddNewUser } } = config;

export default Controller.extend({
  store: service(),
  queryParams: {
    offset: 'offset',
    limit: 'limit',
    query: 'filter',
    showNewUserForm: 'addUser'
  },
  offset: 0,
  limit: 25,
  query: '',
  allowAddNewUser: allowAddNewUser,
  showNewUserForm: false,

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
    toggleNewUserForm(){
      this.set('showNewUserForm', !this.get('showNewUserForm'));
    },
    transitionToUser(userId){
      this.transitionToRoute('user', userId);
    }
  }
});
