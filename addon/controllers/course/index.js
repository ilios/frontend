import Controller from '@ember/controller';

export default class CourseIndexController extends Controller {
  queryParams = ['sortSessionsBy', 'filterSessionsBy'];
  sortSessionsBy = null;
  filterSessionsBy = '';
  canCreateSession = false;
  canUpdateCourse = false;

  get sortBy() {
    return this.sortSessionsBy ?? 'title';
  }
}
