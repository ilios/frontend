import Ember from 'ember';
import queryUtils from '../utils/query-utils';

const { Component, computed, inject, isEmpty, run, RSVP } = Ember;
const { service } = inject;
const { debounce } = run;
const { Promise } = RSVP;
const { cleanQuery } = queryUtils;

export default Component.extend({
  store: service(),
  i18n: service(),

  classNames: ['global-search'],

  query: null,
  delay: 500,

  showMoreInputPrompt: false,

  revisedQuery: computed('query', {
    get() {
      const query = this.get('query');
      const revisedQuery = cleanQuery(query);
      const validate = revisedQuery.length > 2;

      if (validate) {
        this.set('showMoreInputPrompt', false);
      } else {
        this.set('showMoreInputPrompt', true);
      }

      return revisedQuery;
    }
  }).readOnly(),

  updateQuery(value) {
    this.set('query', value);
  },

  searchResults: computed('revisedQuery', {
    get() {
      return new Promise(resolve => {
        const q = this.get('revisedQuery');
        const store = this.get('store');

        if (!isEmpty(q)) {
          store.query('user', {
            q,
            'order_by[lastName]': 'ASC',
            'order_by[firstName]': 'ASC',
            limit: 100
          }).then((users) => {
            resolve(users.toArray());
          });
        } else {
          resolve([]);
        }
      });
    }
  }).readOnly(),

  actions: {
    clear() {
      this.setProperties({ query: null, showMoreInputPrompt: false });
    },

    changeValue(value) {
      debounce(this, this.updateQuery, value, this.get('delay'));
    }
  }
});
