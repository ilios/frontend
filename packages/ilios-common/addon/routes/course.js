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

  queryParams = {
    details: {
      replace: true,
    },
    courseLeadershipDetails: {
      replace: true,
    },
    courseObjectiveDetails: {
      replace: true,
    },
    courseTaxonomyDetails: {
      replace: true,
    },
    courseCompetencyDetails: {
      replace: true,
    },
    courseManageLeadership: {
      replace: true,
    },
  };

  titleToken = 'general.coursesAndSessions';
  editable = false;
  #preloadTopLevel = null;

  beforeModel(transition) {
    this.currentUser.requireNonLearner(transition);
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
        this.dataLoader.loadSchoolForCourses(course.belongsTo('school').id()),
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
