import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';
import { loadFroalaEditor } from 'ilios-common/utils/load-froala-editor';

export default Mixin.create({
  permissionChecker: service(),
  titleToken: 'general.coursesAndSessions',
  editable: false,
  async afterModel(course) {
    const permissionChecker = this.get('permissionChecker');
    const editable = await permissionChecker.canUpdateCourse(course);
    this.set('editable', editable);
    //pre load froala so it's available quickly when working in the course
    loadFroalaEditor();
  },
  setupController(controller, model) {
    this._super(controller, model);
    controller.set('editable', this.get('editable'));
  }
});
