import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class CourseIndexRoute extends Route {
  @service permissionChecker;
  @service preserveScroll;
  @service store;
  @service dataLoader;
  @service session;

  canCreateSession = false;
  canUpdateCourse = false;

  async afterModel(course) {
    this.canUpdateCourse = await this.permissionChecker.canUpdateCourse(course);
    this.canCreateSession = await this.permissionChecker.canCreateSession(course);
  }

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('canUpdateCourse', this.canUpdateCourse);
    controller.set('canCreateSession', this.canCreateSession);
  }

  queryParams = {
    sortSessionsBy: {
      replace: true,
    },
    filterSessionsBy: {
      replace: true,
    },
  };

  @action
  willTransition(transition) {
    if (transition.targetName === 'session.index') {
      this.preserveScroll.savePosition('session-list', window.scrollY);
    } else {
      this.preserveScroll.clearPosition('session-list');
    }
  }
}
