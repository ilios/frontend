import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  permissionChecker: service(),
  canUpdate: false,
  /**
   * Preload the school configurations
   * to avoid a pop in later
   */
  async afterModel(programYear){
    const permissionChecker = this.get('permissionChecker');
    const canUpdate = await permissionChecker.canUpdateProgramYear(programYear);
    this.set('canUpdate', canUpdate);
  },
  setupController(controller, model) {
    this._super(controller, model);
    controller.set('canUpdate', this.get('canUpdate'));
  },
});
