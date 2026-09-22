import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
export default class CourseIndexController extends Controller {
  queryParams = ['sortSessionsBy', 'filterSessionsBy', 'expandedSessions'];

  filterSessionsBy = '';
  canCreateSession = false;
  canUpdateCourse = false;

  @tracked sortSessionsBy = null;
  @tracked expandedSessions = null;

  get sortBy() {
    return this.sortSessionsBy ?? 'title';
  }

  get expandedSessionIds() {
    return this.expandedSessions?.split('-') ?? [];
  }

  setExpandedSessionIds = (ids) => {
    if (!ids || !ids.length) {
      this.expandedSessions = null;
    } else {
      //use a Set to remove duplicates
      this.expandedSessions = [...new Set(ids)].join('-');
    }
  };
}
