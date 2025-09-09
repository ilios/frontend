import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
export default class CourseIndexController extends Controller {
  queryParams = ['sortSessionsBy', 'filterSessionsBy', 'expandAllSessions'];
  @tracked sortSessionsBy = null;
  filterSessionsBy = '';
  expandAllSessions = false;
  canCreateSession = false;
  canUpdateCourse = false;

  get sortBy() {
    return this.sortSessionsBy ?? 'title';
  }
}
