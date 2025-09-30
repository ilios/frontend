import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';

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

  changeTitleFilter = task({ restartable: true }, async (value) => {
    this.titleFilter = value;
    await timeout(250);
    return value;
  });
}
