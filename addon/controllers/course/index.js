import Controller from '@ember/controller';

export default class CourseIndexController extends Controller {
  queryParams = {
    sortSessionsBy: 'sortBy',
    filterSessionsBy: 'filterBy',
  };
  sortSessionsBy = 'title';
  filterSessionsBy = '';
  canCreateSession = false;
  canUpdateCourse = false;
}
