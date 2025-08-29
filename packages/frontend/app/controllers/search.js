import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class SearchController extends Controller {
  queryParams = [
    {
      page: 'page',
      query: 'q',
      schools: 'schools',
      years: 'years',
    },
  ];

  @tracked page = 1;
  @tracked query = '';
  @tracked schools = null;
  @tracked years = null;

  get schoolIdsArray() {
    return this.schools ? this.schools.split('-') : [];
  }

  get selectedYearsArray() {
    return this.years ? this.years.split('-').map(Number) : [];
  }

  setQuery = (query) => {
    this.page = 1;
    this.query = query;
  };

  setSchools = (schools) => {
    const str = schools.length ? schools.join('-') : null;
    this.schools = str;
  };

  setYears = (years) => {
    const str = years.length ? years.join('-') : null;
    this.years = str;
  };
}
