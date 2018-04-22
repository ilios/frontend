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
  async afterModel(session){
    const permissionChecker = this.get('permissionChecker');

    const course = await session.get('course');
    const school = await course.get('school');
    await school.get('configurations');

    let canUpdate;
    if (!enforceRelationshipCapabilityPermissions) {
      canUpdate = !course.get('locked');
    } else {
      canUpdate = await permissionChecker.canUpdateSession(session);
    }

    this.set('canUpdate', canUpdate);
  },
  setupController(controller, model) {
    this._super(controller, model);
    controller.set('canUpdate', this.get('canUpdate'));
  },
});
