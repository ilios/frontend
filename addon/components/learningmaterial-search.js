import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { task } from 'ember-concurrency';

export default Component.extend({
  store: service(),
  intl: service(),
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
  'data-test-learningmaterial-search': true,

  init(){
    this._super(...arguments);
    this.set('searchResults', []);
  },
  actions: {
    search(query){
      if (query.trim() === '') {
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
    clear(){
      this.set('searchResults', []);
      this.set('searchReturned', false);
      this.set('searching', false);
      this.set('searchPage', 0);
      this.set('hasMoreSearchResults', false);
      this.set('query', '');
    },
  },
  searchMore: task(function * () {
    const query = this.get('query');
    const results  = yield this.get('store').query('learningMaterial', {
      q: query,
      limit: this.get('searchResultsPerPage') + 1,
      offset: this.get('searchPage') * this.get('searchResultsPerPage'),
      'order_by[title]': 'ASC',
    });
    let lms = results.map(lm => {
      return lm;
    });
    this.set('searchPage', this.get('searchPage') + 1);
    this.set('hasMoreSearchResults', (lms.length > this.get('searchResultsPerPage')));
    if (this.get('hasMoreSearchResults')) {
      lms.pop();
    }
    this.get('searchResults').pushObjects(lms);
  }).drop(),

  addLearningMaterial: task(function * (lm) {
    yield this.add(lm);
  }).enqueue(),

});
