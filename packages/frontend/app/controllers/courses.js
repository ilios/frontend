import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { restartableTask, timeout } from 'ember-concurrency';

export default class CoursesController extends Controller {
  queryParams = [
    { schoolId: 'school' },
    { sortCoursesBy: 'sortBy' },
    { titleFilter: 'filter' },
    { year: 'year' },
    { userCoursesOnly: 'mycourses' },
  ];

  @tracked schoolId = null;
  @tracked sortCoursesBy = 'title';
  @tracked titleFilter = null;
  @tracked userCoursesOnly = false;
  @tracked year = null;

  @action
  changeSelectedYear(year) {
    this.set('year', year);
  }

  @action
  changeSelectedSchool(schoolId) {
    this.set('schoolId', schoolId);
  }

  @action
  toggleUserCoursesOnly() {
    this.userCoursesOnly = !this.userCoursesOnly;
  }

  changeTitleFilter = restartableTask(async (value) => {
    this.titleFilter = value;
    await timeout(250);
    return value;
  });
}
