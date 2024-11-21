import { service } from '@ember/service';
import Route from '@ember/routing/route';

export default class PrintCourseRoute extends Route {
  @service currentUser;
  @service dataLoader;
  @service session;
  @service router;

  titleToken = 'general.coursesAndSessions';
  canViewUnpublished = false;

  async model(params) {
    return this.dataLoader.loadCourse(params.course_id);
  }

  // only allow privileged users to view unpublished courses
  async afterModel(course, transition) {
    this.canViewUnpublished = this.currentUser.performsNonLearnerFunction;
    if (this.canViewUnpublished || course.isPublishedOrScheduled) {
      return await Promise.all([
        this.dataLoader.loadCourse(course.id),
        this.dataLoader.loadCourseSessions(course.id),
      ]);
    }

    transition.abort();
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('canViewUnpublished', this.canViewUnpublished);
  }

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
    if (!this.currentUser.performsNonLearnerFunction) {
      this.router.replaceWith('/four-oh-four');
    }
  }
}
