import Ember from 'ember';

const { Component, computed, inject, isEmpty, run } = Ember;
const { service } = inject;
const { debounce } = run;
const { trim } = Ember.$;
const { PromiseObject } = DS;

function cleanQuery(query) {
  return trim(query).replace(/[\-,?~!@#$%&*+\-'="]/, '');
}

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
      const validate = this.checkQueryLength(revisedQuery);

      if (validate) {
        this.set('showMoreInputPrompt', false);
      } else {
        this.set('showMoreInputPrompt', true);
      }

      return revisedQuery;
    }
  }).readOnly(),

  _updateQuery(value) {
    this.set('query', value);
  },

  checkQueryLength(query) {
    return query.length > 2 ? true : false;
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
      debounce(this, this._updateQuery, value, this.get('delay'));
    }
  }
});
