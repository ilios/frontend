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

  page: null,
  query: null,
  selectedYear: null,
  size: 10,
  yearOptions: null,
  onQuery() {},
  onSelectPage() {},

  isLoading: reads('search.isRunning'),
  hasResults: reads('results.length'),
  results: reads('search.lastSuccessful.value'),

  authHeaders: computed('session.isAuthenticated', function() {
    const session = this.session;
    const { jwt } = session.data.authenticated;
    let headers = {};
    if (jwt) {
      headers['X-JWT-Authorization'] = `Token ${jwt}`;
    }

    return new Headers(headers);
  }),

  filteredResults: computed('results', 'selectedYear', function() {
    return this.results ? this.results.filterBy('year', this.selectedYear) : [];
  }),

  paginatedResults: computed('filteredResults', 'page', 'size', function() {
    const { page, size } = this.getProperties('page', 'size');
    return this.filteredResults.slice((page * size) - size, page * size);
  }),

  search: task(function* () {
    const q = cleanQuery(this.query);
    this.onQuery(q);
    const host = this.iliosConfig.apiHost?this.iliosConfig.apiHost:window.location.protocol + '//' + window.location.host;
    const url = `${host}/search/v1/curriculum?q=${q}`;
    const response = yield fetch(url, {
      headers: this.authHeaders
    });
    const { results: { courses } } = yield response.json();
    this.setUpYearFilter(courses.mapBy('year'));
    return courses;
  }).observes('query').restartable(),

  init() {
    this._super(...arguments);

    if (this.query) {
      this.search.perform();
    }
  },

  actions: {
    setSelectedYear(year) {
      this.set('selectedYear', parseInt(year, 10));
      this.onSelectPage(1);
    }
  },

  setUpYearFilter(years) {
    const yearOptions = years.uniq().sort();
    const selectedYear = yearOptions[yearOptions.length-1];
    this.setProperties({ selectedYear, yearOptions });
  }
});
