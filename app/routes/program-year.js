import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { loadFroalaEditor } from 'ilios-common/utils/load-froala-editor';

export default Route.extend({
  permissionChecker: service(),
  canUpdate: false,
  /**
   * Preload the school configurations
   * to avoid a pop in later
   */
  async afterModel(programYear){
    const permissionChecker = this.permissionChecker;
    const canUpdate = await permissionChecker.canUpdateProgramYear(programYear);
    this.set('canUpdate', canUpdate);
    //pre load froala so it's available quickly when working in the course
    loadFroalaEditor();
  },
  setupController(controller, model) {
    this._super(controller, model);
    controller.set('canUpdate', this.canUpdate);
  },
});
