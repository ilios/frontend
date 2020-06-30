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
    // happens in afterModel as well for when the course is passed in
    return this.dataLoader.loadCourse(params.course_id);
  }

  async afterModel(course) {
    //pre load froala so it's available quickly when working in the course but don't actually wait for it
    loadFroalaEditor();

    await Promise.all([
      this.dataLoader.loadCourse(course.id),
      this.preload(),
    ]);

    this.editable = await this.permissionChecker.canUpdateCourse(course);
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('editable', this.editable);
  }

  preload() {
    if (!this.#preloadTopLevel) {
      this.#preloadTopLevel = Promise.all([
        this.store.findAll('course-clerkship-type'),
        this.store.findAll('learning-material-status'),
        this.store.findAll('learning-material-user-role'),
      ]);
    }

    return this.#preloadTopLevel;
  }
}
