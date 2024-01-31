import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class SearchController extends Controller {
  queryParams = [
    {
      page: 'page',
      query: 'q',
      ignoredSchoolIds: 'ignoredSchools',
      selectedYear: 'year',
    },
  ];

  @tracked page = 1;
  @tracked query = '';
  @tracked ignoredSchoolIds = null;
  @tracked selectedYear = null;

  get ignoredSchoolIdsArray() {
    return this.ignoredSchoolIds ? this.ignoredSchoolIds.split('-') : [];
  }

  get selectedYearInt() {
    return this.selectedYear ? parseInt(this.selectedYear, 10) : null;
  }

  @action
  setQuery(query) {
    // don't reset the page when returning back to the same query
    if (query !== this.query) {
      this.page = 1;
      this.query = query;
      this.ignoredSchoolIds = null;
      this.selectedYear = null;
    }
  }

  @action
  setIgnoredSchools(schools) {
    const str = schools.length ? schools.join('-') : null;
    this.set('ignoredSchoolIds', str);
  }

  @action
  setSelectedYear(year) {
    this.selectedYear = year;
  }

  @action
  setPage(page) {
    this.page = page;
  }
}
