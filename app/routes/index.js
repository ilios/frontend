import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class IndexRoute extends Route {
  @service router;

  beforeModel(transition) {
    this.router.replaceWith('dashboard', {
      queryParams: {
        cohorts: null,
        courseFilters: null,
        courseLevels: null,
        courses: null,
        mySchedule: null,
        reportYear: null,
        sessionTypes: null,
        show: null,
        showFilters: null,
        terms: null,
        view: null,
      },
    });
  }
}
