import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default Component.extend({
  iliosConfig: service(),
  intl: service(),
  iliosSearch: service('search'),

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

  filteredResults: computed('results.[]', 'selectedYear', function() {
    const results = this.results;
    const selectedYear = this.selectedYear;

    if (results) {
      return selectedYear
        ? results.filterBy('year', this.selectedYear)
        : results;
    } else {
      return [];
    }
  }),

  paginatedResults: computed('filteredResults.[]', 'page', 'size', function() {
    const { page, size } = this.getProperties('page', 'size');
    return this.filteredResults.slice((page * size) - size, page * size);
  }),

  search: task(function* () {
    this.onQuery(this.query);
    const { courses } = yield this.iliosSearch.forCurriculum(this.query);
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
      this.set('selectedYear', year ? parseInt(year, 10) : null);
      this.onSelectPage(1);
    }
  },

  setUpYearFilter(years) {
    const yearOptions = years.uniq().sort().reverse();
    this.set('yearOptions', yearOptions);
  }
});
