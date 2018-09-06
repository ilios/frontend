import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';

export default Mixin.create({
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
    const canUpdate = await permissionChecker.canUpdateSession(session);
    this.set('canUpdate', canUpdate);
  },
  setupController(controller, model) {
    this._super(controller, model);
    controller.set('canUpdate', this.get('canUpdate'));
  },
});
