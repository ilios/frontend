import Component from '@ember/component';
import { cleanQuery } from 'ilios-common/utils/query-utils';
import { computed } from '@ember/object';
import fetch from 'fetch';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default Component.extend({
  iliosConfig: service(),
  intl: service(),
  session: service(),

  query: null,
  onQuery() {},

  isLoading: reads('search.isRunning'),
  hasResults: reads('results.length'),
  results: reads('search.lastSuccessful.value'),

  authHeaders: computed('session.isAuthenticated', function(){
    const session = this.session;
    const { jwt } = session.data.authenticated;
    let headers = {};
    if (jwt) {
      headers['X-JWT-Authorization'] = `Token ${jwt}`;
    }

    return new Headers(headers);
  }),

  search: task(function* () {
    const q = cleanQuery(this.query);
    this.onQuery(q);

    const host = this.iliosConfig.apiHost?this.iliosConfig.apiHost:window.location.protocol + '//' + window.location.host;
    const url = `${host}/experimental_search/v1/curriculum?q=${q}`;
    const response = yield fetch(url, {
      headers: this.authHeaders
    });
    const { results: { courses } } = yield response.json();

    return courses;
  }).observes('query').restartable(),

  init() {
    this._super(...arguments);

    if (this.query) {
      this.search.perform();
    }
  },
});
