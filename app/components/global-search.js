import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

const MIN_INPUT = 3;

export default Component.extend({
  iliosConfig: service(),
  intl: service(),
  iliosSearch: service('search'),
  store: service(),

  page: null,
  query: null,
  selectedYear: null,
  unselectedSchools: null,
  size: 10,
  yearOptions: null,
  onQuery() {},
  onSelectPage() {},

  isLoading: reads('search.isRunning'),
  hasResults: reads('results.length'),
  results: reads('search.lastSuccessful.value'),
  allSchools: reads('loadSchools.lastSuccessful.value'),

  filteredResults: computed('results.[]', 'selectedYear', 'unselectedSchools.[]', function() {
    if (this.results) {
      const yearFilteredResults = this.results.filter(course => this.selectedYear ? course.year === this.selectedYear : true);
      return yearFilteredResults.filter(course => !this.unselectedSchools.includes(course.school));
    } else {
      return [];
    }
  }),

  paginatedResults: computed('filteredResults.[]', 'page', 'size', function() {
    const { page, size } = this.getProperties('page', 'size');
    return this.filteredResults.slice((page * size) - size, page * size);
  }),

  schoolOptions: computed('allSchools.[]', 'results.[]', function () {
    if (this.results && this.results.length && this.allSchools && this.allSchools.length) {
      const emptySchools = this.allSchools.map(title => {
        return {
          title,
          results: 0
        };
      }).sortBy('title');
      const options = this.results.reduce((set, course) => {
        let schoolOption = set.findBy('title', course.school);
        schoolOption.results++;

        return set;
      }, emptySchools);
      return options;
    } else {
      return [];
    }
  }),

  search: task(function* () {
    this.onQuery(this.query);
    const { courses } = yield this.iliosSearch.forCurriculum(this.query);
    this.setUpYearFilter(courses.mapBy('year'));

    return courses;
  }).observes('query').restartable(),

  init() {
    this._super(...arguments);
    this.set('unselectedSchools', []);
    this.loadSchools.perform();

    if (this.query && this.query.length >= MIN_INPUT) {
      this.search.perform();
    }
  },

  actions: {
    setSelectedYear(year) {
      this.set('selectedYear', year ? parseInt(year, 10) : null);
      this.onSelectPage(1);
    },
    toggleSchoolSelection(school) {
      if (this.unselectedSchools.includes(school)) {
        this.unselectedSchools.removeObject(school);
      } else {
        this.unselectedSchools.pushObject(school);
      }
    }
  },

  loadSchools: task(function* () {
    const schools = yield this.store.findAll('school');
    return schools.mapBy('title');
  }),

  setUpYearFilter(years) {
    const yearOptions = years.uniq().sort().reverse();
    this.set('yearOptions', yearOptions);
  }
});
