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
  tagName: "",
  page: null,
  query: null,
  selectedYear: null,
  ignoredSchoolIds: null,
  size: 10,
  yearOptions: null,
  onQuery() {},
  onSelectPage() {},
  setIgnoredSchoolIds() {},
  setSelectedYear() {},
  isLoading: reads('search.isRunning'),
  hasResults: reads('results.length'),
  results: reads('search.lastSuccessful.value'),
  allSchools: reads('loadSchools.lastSuccessful.value'),

  ignoredSchoolTitles: computed('ignoredSchoolIds.[]', 'allSchools.[]', function() {
    if (!this.ignoredSchoolIds) {
      return [];
    }
    return this.ignoredSchoolIds.map(id => {
      const school = this.allSchools.findBy('id', id);
      return school ? school.title : '';
    });
  }),

  filteredResults: computed('results.[]', 'selectedYear', 'ignoredSchoolTitles.[]', function() {
    if (this.results) {
      const yearFilteredResults = this.results.filter(course => this.selectedYear ? course.year === this.selectedYear : true);
      return yearFilteredResults.filter(course => !this.ignoredSchoolTitles.includes(course.school));
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
      const emptySchools = this.allSchools.map(({id, title}) => {
        return {
          id,
          title,
          results: 0
        };
      }).sortBy('title');
      const options = this.results.reduce((set, course) => {
        const schoolOption = set.findBy('title', course.school);
        schoolOption.results++;

        return set;
      }, emptySchools);
      return options;
    } else {
      return [];
    }
  }),

  init() {
    this._super(...arguments);
    this.loadSchools.perform();

    if (this.query && this.query.length >= MIN_INPUT) {
      this.search.perform();
    }
  },

  actions: {
    setSelectedYear(year) {
      this.setSelectedYear(year ? parseInt(year, 10) : null);
      this.onSelectPage(1);
    },
    toggleSchoolSelection(id) {
      const ignoredSchoolIds = this.ignoredSchoolIds ? [...this.ignoredSchoolIds] : [];

      if (ignoredSchoolIds.includes(id)) {
        ignoredSchoolIds.removeObject(id);
      } else {
        ignoredSchoolIds.pushObject(id);
      }

      this.onSelectPage(1);
      this.setIgnoredSchoolIds(ignoredSchoolIds);
    }
  },

  search: task(function* () {
    this.onQuery(this.query);
    const { courses } = yield this.iliosSearch.forCurriculum(this.query);
    this.setUpYearFilter(courses.mapBy('year'));

    return courses;
  }).restartable(),

  loadSchools: task(function* () {
    const schools = yield this.store.findAll('school');
    return schools;
  }),

  setUpYearFilter(years) {
    const yearOptions = years.uniq().sort().reverse();
    this.set('yearOptions', yearOptions);
  }
});
