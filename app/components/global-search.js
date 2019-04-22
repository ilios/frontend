import Component from '@ember/component';
import { task, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';


export default Component.extend({
  intl: service(),
  tagName: '',

  search: task(function* () {
    yield timeout(1);
    if (!this.query || this.query.length === 0) {
      return [];
    }

    // let searchResults = yield this.store.query('search', { q });
    let searchResults = [];
    if (searchResults.length === 0) {
      return [{
        type: 'text',
        text: this.intl.t('general.noSearchResultsPrompt')
      }];
    }

    let results = [
      {
        type: 'summary',
        text: this.intl.t('general.resultsCount', {count: 11})
      }
    ];

    return results;
  }).restartable().on('didInsertElement'),
});
