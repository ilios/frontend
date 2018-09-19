/* eslint ember/order-in-components: 0 */
import $ from 'jquery';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { task } from 'ember-concurrency';

export default Component.extend({
  store: service(),
  i18n: service(),
  init(){
    this._super(...arguments);
    this.set('searchResults', []);
  },
  classNames: ['learningmaterial-search'],
  currentMaterials: null,
  query: '',
  searchResults: null,
  searchPage: 0,
  searchResultsPerPage: 50,
  hasMoreSearchResults: false,
  targetItemTitle: '',
  searching: false,
  searchReturned: false,

  searchMore: task(function * () {
    const query = this.query;
    const results  = yield this.store.query('learningMaterial', {
      q: query,
      limit: this.searchResultsPerPage + 1,
      offset: this.searchPage * this.searchResultsPerPage,
      'order_by[title]': 'ASC',
    });
    let lms = results.map(lm => {
      return lm;
    });
    this.set('searchPage', this.searchPage + 1);
    this.set('hasMoreSearchResults', (lms.length > this.searchResultsPerPage));
    if (this.hasMoreSearchResults) {
      lms.pop();
    }
    this.searchResults.pushObjects(lms);
  }).drop(),

  addLearningMaterial: task(function * (lm) {
    yield this.sendAction('add', lm);
  }).enqueue(),

  actions: {
    search(query){
      if ($.trim(query) === '') {
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
      this.store.query('learningMaterial', {
        q: query,
        limit: this.searchResultsPerPage + 1,
        'order_by[title]': 'ASC',
      }).then(results => {
        let lms = results.map(lm => {
          return lm;
        });
        this.set('searchReturned', true);
        this.set('searching', false);
        this.set('searchPage', 1);
        this.set('hasMoreSearchResults', (lms.length > this.searchResultsPerPage));
        if (this.hasMoreSearchResults) {
          lms.pop();
        }
        this.set('searchResults', lms);
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
