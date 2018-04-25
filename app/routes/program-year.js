import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import config from 'ilios/config/environment';
const { IliosFeatures: { enforceRelationshipCapabilityPermissions } } = config;

export default Route.extend({
  permissionChecker: service(),
  canUpdate: false,
  /**
   * Preload the school configurations
   * to avoid a pop in later
   */
  async afterModel(programYear){
    const permissionChecker = this.get('permissionChecker');

    let canUpdate = !programYear.get('locked') && !programYear.get('archived');
    if (enforceRelationshipCapabilityPermissions) {
      canUpdate = await permissionChecker.canUpdateProgramYear(programYear);
    }

    this.set('canUpdate', canUpdate);
  },
  setupController(controller, model) {
    this._super(controller, model);
    controller.set('canUpdate', this.get('canUpdate'));
  },
});
