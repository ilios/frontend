import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { loadFroalaEditor } from 'ilios-common/utils/load-froala-editor';

export default class CourseRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service permissionChecker;
  @service dataLoader;

  titleToken = 'general.coursesAndSessions';
  editable = false;
  #preloadTopLevel = null;

  async model(params) {
    // load the course here in case the model isn't passed in
    // happens in afterModel as well for when the model is passed in
    const arr = await this.preload(params.course_id);

    return arr[0];
  }

  async afterModel(course) {
    //pre load froala so it's available quickly when working in the course but don't actually wait for it
    loadFroalaEditor();

    await this.preload(course.id);
    this.editable = await this.permissionChecker.canUpdateCourse(course);
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('editable', this.editable);
  }

  preload(courseId) {
    if (!this.#preloadTopLevel) {
      this.#preloadTopLevel = [
        this.store.findAll('course-clerkship-type'),
        this.store.findAll('learning-material-status'),
        this.store.findAll('learning-material-user-role'),
      ];
    }

    return Promise.all([
      this.dataLoader.loadCourse(courseId),
      ...this.#preloadTopLevel,
    ]);
  }
}
