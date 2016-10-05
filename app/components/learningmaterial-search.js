import Ember from 'ember';
import { task } from 'ember-concurrency';

const { Component, inject } = Ember;
const { service } = inject;

var ProxiedMaterials = Ember.ObjectProxy.extend({
  isActive: false
});

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

  addLearningMaterial: task(function * (proxy) {
    let lm = proxy.content;
    if (! this.get('currentMaterials').contains(lm)) {
      proxy.set('isActive', false);
      this.sendAction('add', lm);
    }
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
      const currentMaterials = this.get('currentMaterials');
      this.get('store').query('learningMaterial', {
        q: query,
        limit: this.get('searchResultsPerPage') + 1,
        'order_by[title]': 'ASC',
      }).then(lms => {
        let results = lms.map(lm => {
          return ProxiedMaterials.create({
            content: lm,
            isActive: ! currentMaterials.contains(lm)
          });
        });
        this.set('searchReturned', true);
        this.set('searching', false);
        this.set('searchPage', 1);
        this.set('hasMoreSearchResults', (results.length > this.get('searchResultsPerPage')));
        if (this.get('hasMoreSearchResults')) {
          results.pop();
        }
        this.set('searchResults', results);
      });
    },
    searchMore() {
      const currentMaterials = this.get('currentMaterials');
      const query = this.get('query');
      this.get('store').query('learningMaterial', {
        q: query,
        limit: this.get('searchResultsPerPage') + 1,
        offset: this.get('searchPage') * this.get('searchResultsPerPage'),
        'order_by[title]': 'ASC',
      }).then(lms => {
        let results = lms.map(lm => {
          return ProxiedMaterials.create({
            content: lm,
            isActive: ! currentMaterials.contains(lm)
          });
        });
        this.set('searchPage', this.get('searchPage') + 1);
        this.set('hasMoreSearchResults', (results.length > this.get('searchResultsPerPage')));
        if (this.get('hasMoreSearchResults')) {
          results.pop();
        }
        this.get('searchResults').pushObjects(results);
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
