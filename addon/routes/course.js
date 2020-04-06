import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { loadFroalaEditor } from 'ilios-common/utils/load-froala-editor';

export default class CourseRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service permissionChecker;

  titleToken = 'general.coursesAndSessions';
  editable = false;

  async afterModel(course) {
    this.editable = await this.permissionChecker.canUpdateCourse(course);
    //pre load froala so it's available quickly when working in the course
    loadFroalaEditor();
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('editable', this.get('editable'));
  }
}
