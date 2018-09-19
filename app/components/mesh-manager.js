/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import ObjectProxy from '@ember/object/proxy';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { task } from 'ember-concurrency';
import layout from '../templates/components/mesh-manager';

const ProxiedDescriptors = ObjectProxy.extend({
  terms: null,
  isActive: computed('content', 'terms.[]', function () {
    const terms = this.terms;
    if (isEmpty(terms)) {
      return true;
    }
    return !this.terms.includes(this.content);
  })
});

export default Component.extend({
  store: service(),
  i18n: service(),
  init(){
    this._super(...arguments);
    this.set('searchResults', []);
    this.set('sortTerms', ['name']);
  },
  'data-test-mesh-manager': true,
  layout: layout,
  classNames: ['mesh-manager'],
  terms: null,
  editable: false,
  query: '',
  searchResults: null,
  searchPage: 0,
  searchResultsPerPage: 50,
  hasMoreSearchResults: false,
  targetItemTitle: '',
  searching: false,
  searchReturned: false,
  sortTerms: null,
  sortedTerms: computed('terms.@each.name', function(){
    var terms = this.terms;
    if(!terms || terms.length === 0){
      return [];
    }
    return terms.sortBy('name');
  }),
  tagName: 'section',

  searchMore: task(function * () {
    var terms = this.terms;
    var query = this.query;
    const descriptors = yield this.store.query('mesh-descriptor', {
      q: query,
      limit: this.searchResultsPerPage + 1,
      offset: this.searchPage * this.searchResultsPerPage
    });
    let results = descriptors.map(function(descriptor){
      return ProxiedDescriptors.create({
        content: descriptor,
        terms: terms
      });
    });
    this.set('searchPage', this.searchPage + 1);
    this.set('hasMoreSearchResults', (results.length > this.searchResultsPerPage));
    if (this.hasMoreSearchResults) {
      results.pop();
    }
    this.searchResults.pushObjects(results);
  }).drop(),


  actions: {
    search(query) {
      this.set('searchReturned', false);
      this.set('searching', true);
      this.set('query', query);
      var terms = this.terms;
      this.store.query('mesh-descriptor', {
        q: query,
        limit: this.searchResultsPerPage + 1
      }).then(descriptors => {
        let results = descriptors.map(function(descriptor){
          return ProxiedDescriptors.create({
            content: descriptor,
            terms: terms
          });
        });
        this.set('searchReturned', true);
        this.set('searching', false);
        this.set('searchPage', 1);
        this.set('hasMoreSearchResults', (results.length > this.searchResultsPerPage));
        if (this.hasMoreSearchResults) {
          results.pop();
        }
        this.set('searchResults', results);
      });
    },

    clear() {
      this.set('searchResults', []);
      this.set('searchReturned', false);
      this.set('searching', false);
      this.set('searchPage', 0);
      this.set('hasMoreSearchResults', false);
      this.set('query', '');
    },
    add(term) {
      const editable = this.editable;
      if (editable) {
        this.sendAction('add', term.get('content'));
      }
    },
    remove(term) {
      const editable = this.editable;
      if (editable) {
        this.sendAction('remove', term);
      }
    }
  }
});
