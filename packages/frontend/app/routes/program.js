import Route from '@ember/routing/route';
import { service } from '@ember/service';

import { findRecord } from '@ember-data/legacy-compat/builders';

export default class ProgramRoute extends Route {
  @service permissionChecker;
  @service session;
  @service store;

  canUpdate = false;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model(params) {
    return (await this.store.request(findRecord('program', params.program_id))).content;
  }

  async afterModel(program) {
    const permissionChecker = this.permissionChecker;
    this.canUpdate = await permissionChecker.canUpdateProgram(program);
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('canUpdate', this.canUpdate);
  }
}
