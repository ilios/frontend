import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { inject as service } from '@ember/service';

export default Route.extend(AuthenticatedRouteMixin, {
  permissionChecker: service(),
  titleToken: 'general.curriculumInventoryReports',
  canUpdate: false,
  async afterModel(report){
    const permissionChecker = this.get('permissionChecker');

    const canUpdate = await permissionChecker.canUpdateCurriculumInventoryReport(report);
    this.set('canUpdate', canUpdate);
  },
  setupController(controller, model) {
    this._super(controller, model);
    controller.set('canUpdate', this.get('canUpdate'));
  },
});
