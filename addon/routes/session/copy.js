import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default class SessionCopyRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service permissionChecker;

  canUpdate = false;

  async afterModel(session) {
    this.canUpdate = await this.permissionChecker.canUpdateSession(session);
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('canUpdate', this.canUpdate);
  }
}
