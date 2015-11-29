import Ember from 'ember';
import DS from 'ember-data';

const { computed, Controller, inject, isEmpty, run } = Ember;
const { service } = inject;
const { debounce } = run;
const { trim } = Ember.$;
const { PromiseObject } = DS;

function cleanQuery(query) {
  return trim(query).replace(/[\-,?~!@#$%&*+\-'="]/, '');
}

export default Controller.extend({
  queryParams: ['page'],
  page: 1,

  currentUser: service(),
  store: service(),

  query: null,
  delay: 500,

  limit: 20,
  offset: 0,

  prevPages: computed('page', {
    get() {
      const page = this.get('page');
      return page !== 1;
    }
  }).readOnly(),

  morePages: computed('model', {
    get() {
      const { model, limit } = this.getProperties('model', 'limit');
      return model.users.length > limit;
    }
  }).readOnly(),

  users: computed('model', {
    get() {
      const users = this.get('model.users');

      if (users.length === 21) {
        return users.slice(0, 20);
      } else {
        return users;
      }
    }
  }).readOnly(),

  resultsCount: null,

  searchResults: computed('query', 'offset', {
    get() {
      const q = this.get('query');
      const limit = this.get('limit') + 1;
      const { school, offset } = this.getProperties('school', 'offset');
      let searchResults;

      if (!isEmpty(cleanQuery(q))) {
        searchResults = this.get('store').query('user', {
          school, limit, q, offset,
          'order_by[lastName]': 'ASC',
          'order_by[firstName]': 'ASC'
        }).then((response) => {
          const users = response.toArray();
          this.set('resultsCount', users.length);

          if (users.length === 21) {
            return users.slice(0, 20);
          } else {
            return users;
          }
        });
      }

      return PromiseObject.create({
        promise: searchResults
      });
    }
  }).readOnly(),

  prevResults: computed('offset', {
    get() {
      const offset = this.get('offset');
      return offset !== 0;
    }
  }).readOnly(),

  moreResults: computed('resultsCount', {
    get() {
      const { resultsCount, limit } = this.getProperties('resultsCount', 'limit');
      return resultsCount > limit;
    }
  }).readOnly(),

  _updateQuery(value) {
    this.setProperties({ query: value, offset: 0 });
  },

  actions: {
    getPrevPage() {
      const query = this.get('query');

      if (query) {
        this.set('offset', this.get('offset') - 20);
      } else {
        this.set('page', this.get('page') - 1);
      }
    },

    getNextPage() {
      const query = this.get('query');

      if (query) {
        this.set('offset', this.get('offset') + 20);
      } else {
        this.set('page', this.get('page') + 1);
      }
    },

    changeValue(value) {
      debounce(this, this._updateQuery, value, this.get('delay'));
    }
  }
});
