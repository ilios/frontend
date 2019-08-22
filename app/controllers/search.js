import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({
  queryParams: {
    page: 'page',
    query: 'q',
    ignoredSchoolIds: 'ignoredSchools',
    selectedYear: 'year',
  },

  page: 1,
  query: '',
  ignoredSchoolIds: null,
  selectedYear: null,

  init() {
    this._super(...arguments);
  },

  ignoredSchoolIdsArray: computed('ignoredSchoolIds.[]', function() {
    return this.ignoredSchoolIds ? this.ignoredSchoolIds.split('-') : [];
  }),

  selectedYearInt: computed('selectedYear', function() {
    return this.selectedYear ? parseInt(this.selectedYear, 10) : null;
  }),

  actions: {
    setQuery(query) {
      // don't reset the page when returning back to the same query
      if (query !== this.query) {
        this.setProperties({ page: 1, query, ignoredSchoolIds: null, selectedYear: null });
      }
    },
    setIgnoredSchools(schools) {
      const str = schools.length ? schools.join('-') : null;
      this.set('ignoredSchoolIds', str);
    }
  }
});
