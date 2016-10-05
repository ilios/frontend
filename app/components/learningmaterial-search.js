import Ember from 'ember';
import { task } from 'ember-concurrency';

const { Component, inject } = Ember;
const { service } = inject;

export default Component.extend({
  store: service(),
  i18n: service(),
  classNames: ['learningmaterial-search'],
  currentMaterials: [],
  query: '',
  searchResults: [],
  searchPage: 0,
  searchResultsPerPage: 50,
  hasMoreSearchResults: false,
  targetItemTitle: '',
  searching: false,
  searchReturned: false,

  addLearningMaterial: task(function * (lm) {
    yield this.sendAction('add', lm);
  }).enqueue(),

  actions: {
    search(query){
      if (Ember.$.trim(query) === '') {
        this.set('searchReturned', false);
        this.set('searching', false);
        this.set('searchPage', 1);
        this.set('hasMoreSearchResults', false);
        this.set('searchResults', []);
        return;
      }
      this.set('searchReturned', false);
      this.set('searching', true);
      this.set('query', query);
      this.get('store').query('learningMaterial', {
        q: query,
        limit: this.get('searchResultsPerPage') + 1,
        'order_by[title]': 'ASC',
      }).then(results => {
        let lms = results.map(lm => {
          return lm;
        });
        this.set('searchReturned', true);
        this.set('searching', false);
        this.set('searchPage', 1);
        this.set('hasMoreSearchResults', (lms.length > this.get('searchResultsPerPage')));
        if (this.get('hasMoreSearchResults')) {
          lms.pop();
        }
        this.set('searchResults', lms);
      });
    },
    searchMore() {
      const query = this.get('query');
      this.get('store').query('learningMaterial', {
        q: query,
        limit: this.get('searchResultsPerPage') + 1,
        offset: this.get('searchPage') * this.get('searchResultsPerPage'),
        'order_by[title]': 'ASC',
      }).then(results => {
        let lms = results.map(lm => {
          return lm;
        });
        this.set('searchPage', this.get('searchPage') + 1);
        this.set('hasMoreSearchResults', (lms.length > this.get('searchResultsPerPage')));
        if (this.get('hasMoreSearchResults')) {
          lms.pop();
        }
        this.get('searchResults').pushObjects(lms);
      });
    },
    clear(){
      this.set('searchResults', []);
      this.set('searchReturned', false);
      this.set('searching', false);
      this.set('searchPage', 0);
      this.set('hasMoreSearchResults', false);
      this.set('query', '');
    },
  }
});
