import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default class SessionCopyRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service permissionChecker;

  canUpdate = false;

  /**
   * Preload the school configurations
   * to avoid a pop in later
   */
  async afterModel(session) {
    const course = await session.get('course');
    const school = await course.get('school');
    await school.get('configurations');
    this.canUpdate = await this.permissionChecker.canUpdateSession(session);
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('canUpdate', this.canUpdate);
  }
}
