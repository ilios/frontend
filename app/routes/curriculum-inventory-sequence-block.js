import RSVP from 'rsvp';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { inject as service } from '@ember/service';

const { all } = RSVP;

export default Route.extend(AuthenticatedRouteMixin, {
  permissionChecker: service(),
  canUpdate: false,
  titleToken: 'general.curriculumInventoryReports',
  async afterModel(model) {
    const permissionChecker = this.permissionChecker;

    const report = await model.get('report');
    const canUpdate = await permissionChecker.canUpdateCurriculumInventoryReport(report);
    this.set('canUpdate', canUpdate);

    //preload data to speed up rendering later
    return all([
      model.get('children'),
      model.get('parent'),
    ]);
  },
  setupController(controller, model) {
    this._super(controller, model);
    controller.set('canUpdate', this.canUpdate);
  },
});
