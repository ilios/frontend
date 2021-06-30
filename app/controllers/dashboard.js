import CommonDashboardController from 'ilios-common/controllers/dashboard';
import { inject as service } from '@ember/service';

export default class DashboardController extends CommonDashboardController {
  @service store;

  //most params come from common controller, but are copied here
  queryParams = [
    'academicYear',
    'cohorts',
    'courseFilters',
    'courseLevels',
    'courses',
    'date',
    'mySchedule',
    'school',
    'sessionTypes',
    'show',
    'showFilters',
    'terms',
    'view',
  ];
}
