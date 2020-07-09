import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { action } from '@ember/object';
import preloadCourse from 'ilios-common/utils/preload-course';

export default class CourseIndexRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service permissionChecker;
  @service preserveScroll;
  @service store;

  canCreateSession = false;
  canUpdateCourse = false;

  /**
   * Prefetch related data to limit network requests
   */
  async afterModel(model) {
    await preloadCourse(this.store, model);
    return this.fillPermissions(model);
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('canUpdateCourse', this.canUpdateCourse);
    controller.set('canCreateSession', this.canCreateSession);
  }

  async fillPermissions(course) {
    this.canUpdateCourse = await this.permissionChecker.canUpdateCourse(course);
    this.canCreateSession = await this.permissionChecker.canCreateSession(course);
  }

  queryParams = {
    sortSessionsBy: {
      replace: true
    },
    filterSessionsBy: {
      replace: true
    },
  }

  @action
  willTransition(transition) {
    if (transition.targetName === 'session.index') {
      this.preserveScroll.savePosition('session-list', window.scrollY);
    } else {
      this.preserveScroll.clearPosition('session-list');
    }
  }
}
