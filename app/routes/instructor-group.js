import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { inject as service } from '@ember/service';

export default Route.extend(AuthenticatedRouteMixin, {
  permissionChecker: service(),
  titleToken: 'general.instructorGroups',
  canUpdate: false,
  async afterModel(instructorGroup) {
    const permissionChecker = this.get('permissionChecker');
    const canUpdate = await permissionChecker.canUpdateInstructorGroup(instructorGroup);
    this.set('canUpdate', canUpdate);
  },
  setupController(controller, model) {
    this._super(controller, model);
    controller.set('canUpdate', this.get('canUpdate'));
  }
});
