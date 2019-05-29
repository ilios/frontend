import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
  intl: service(),

  query: null,
  onQuery() {},

  isLoading: reads('search.isRunning'),
  hasResults: reads('results.length'),
  results: reads('search.lastSuccessful.value'),

  search: task(function* () {
    yield timeout(300);

    // let searchResults = yield this.store.query('search', { q });
    return [{
      link: 'Link to a route',
      description: 'ABC ABC ABC ABC ABC ABC ABC ABC'
    },{
      link: 'Link to a route',
      description: 'ABC ABC ABC ABC ABC ABC ABC ABC'
    }, {
      link: 'Link to a route',
      description: 'ABC ABC ABC ABC ABC ABC ABC ABC'
    }];
  }).observes('query').restartable(),

  init() {
    this._super(...arguments);

    if (this.query) {
      this.search.perform();
    }
  }
});
