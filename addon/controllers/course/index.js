import Controller from '@ember/controller';

export default class CourseIndexController extends Controller {
  queryParams = [
    'sortSessionsBy',
    'filterSessionsBy',
  ];
  sortSessionsBy = 'title';
  filterSessionsBy = '';
  canCreateSession = false;
  canUpdateCourse = false;
}
