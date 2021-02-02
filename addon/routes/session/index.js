import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default class SessionIndexRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service permissionChecker;
  @service store;

  canUpdate = false;

  async afterModel(session) {
    this.canUpdate = await this.permissionChecker.canUpdateSession(session);
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('canUpdate', this.canUpdate);
  }
}
