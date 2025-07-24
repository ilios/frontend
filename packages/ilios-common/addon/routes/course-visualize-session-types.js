import { service } from '@ember/service';
import Route from '@ember/routing/route';
import { map } from 'rsvp';

export default class CourseVisualizeSessionTypesRoute extends Route {
  @service session;
  @service store;
  @service dataLoader;
  @service currentUser;
  @service router;

  titleToken = 'general.coursesAndSessions';

  async model(params) {
    return this.dataLoader.loadCourse(params.course_id);
  }

  async afterModel(course) {
    const sessions = await course.sessions;
    return await map(sessions, (s) => s.sessionType);
  }

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
    if (this.session.isAuthenticated && !this.currentUser.performsNonLearnerFunction) {
      this.router.replaceWith('/four-oh-four');
    }
  }
}
