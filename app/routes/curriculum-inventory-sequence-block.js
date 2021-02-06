import RSVP from 'rsvp';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

const { all } = RSVP;

export default class CurriculumInventorySequenceBlockRoute extends Route {
  @service permissionChecker;
  @service session;

  canUpdate = false;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

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
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('canUpdate', this.canUpdate);
  }
}
