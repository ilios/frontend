import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';
import { all } from 'rsvp';

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

    return all([
      session.get('description'),
      session.get('administrators'),
      session.get('objectives'),
      session.get('learningMaterials'),
      session.get('terms'),
      session.get('offerings'),
    ]);
  },
  setupController(controller, model) {
    this._super(controller, model);
    controller.set('canUpdate', this.get('canUpdate'));
  },
});
