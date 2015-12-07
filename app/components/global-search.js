import Ember from 'ember';
import DS from 'ember-data';
import queryUtils from '../utils/query-utils';

const { Component, computed, inject, isEmpty, run } = Ember;
const { service } = inject;
const { debounce } = run;
const { PromiseObject } = DS;
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
      const q = this.get('revisedQuery');
      const store = this.get('store');

      if (!isEmpty(q)) {
        const searchResults = store.query('user', {
          q,
          'order_by[lastName]': 'ASC',
          'order_by[firstName]': 'ASC'
        }).then((users) => {
          return users;
        });

        return PromiseObject.create({
          promise: searchResults
        });
      }
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
