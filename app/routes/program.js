import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { inject as service } from '@ember/service';

export default Route.extend(AuthenticatedRouteMixin, {
  permissionChecker: service(),
  titleToken: 'general.programs',
  canUpdate: false,
  async afterModel(program) {
    const permissionChecker = this.permissionChecker;
    const canUpdate = await permissionChecker.canUpdateProgram(program);
    this.set('canUpdate', canUpdate);
  },
  setupController(controller, model) {
    this._super(controller, model);
    controller.set('canUpdate', this.canUpdate);
  }
});
