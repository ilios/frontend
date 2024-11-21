import { service } from '@ember/service';
import Route from '@ember/routing/route';
import { loadFroalaEditor } from 'ilios-common/utils/load-froala-editor';

export default class CourseRoute extends Route {
  @service permissionChecker;
  @service dataLoader;
  @service session;
  @service store;
  @service router;
  @service currentUser;

  titleToken = 'general.coursesAndSessions';
  editable = false;
  #preloadTopLevel = null;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
    if (!this.currentUser.performsNonLearnerFunction) {
      // Slash on the route name is necessary here due to this bug:
      // https://github.com/emberjs/ember.js/issues/12945
      this.router.replaceWith('/four-oh-four');
    }
  }

  async model(params) {
    return this.dataLoader.loadCourse(params.course_id);
  }

  async afterModel(course) {
    if (!this.#preloadTopLevel) {
      this.#preloadTopLevel = [
        this.store.findAll('course-clerkship-type'),
        this.store.findAll('learning-material-status'),
        this.store.findAll('learning-material-user-role'),
        //temporarily disabled, waiting on https://github.com/emberjs/data/issues/8110
        // this.dataLoader.loadSchoolForCourses(course.belongsTo('school').id()),
      ];
    }
    const [editable] = await Promise.all([
      this.permissionChecker.canUpdateCourse(course),
      ...this.#preloadTopLevel,
    ]);
    this.editable = editable;

    //pre load froala and course and session data, but don't wait for this to complete
    //this allows the page to load quickly and display our loader without waiting too long
    loadFroalaEditor();
    this.dataLoader.loadCourse(course.id);
    this.dataLoader.loadCourseSessions(course.id);
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('editable', this.editable);
  }
}
