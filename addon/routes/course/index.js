import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { get, action } from '@ember/object';
import preloadCourse from 'ilios-common/utils/preload-course';

export default class CourseIndexRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service permissionChecker;
  @service preserveScroll;
  @service store;

  canCreateSession = false;
  canUpdateCourse = false;

  beforeModel(transition) {
    const isFromSessionIndex = get(transition, 'from.name') === 'session.index';
    this.preserveScroll.set('shouldScrollDown', isFromSessionIndex);
  }

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
  };

  @action
  willTransition(transition) {
    this.preserveScroll.set('isListenerOn', false);
    if (transition.targetName !== 'session.index') {
      this.preserveScroll.set('yPos', null);
    }
  }
}
