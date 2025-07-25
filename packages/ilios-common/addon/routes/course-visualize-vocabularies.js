import { service } from '@ember/service';
import Route from '@ember/routing/route';
import { all, map } from 'rsvp';

export default class CourseVisualizeVocabulariesRoute extends Route {
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
    return await all([course.get('school'), map(sessions, (s) => s.terms)]);
  }

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
    if (this.session.isAuthenticated && !this.currentUser.performsNonLearnerFunction) {
      this.router.replaceWith('/four-oh-four');
    }
  }
}
