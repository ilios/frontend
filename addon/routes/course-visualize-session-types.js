import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { map } from 'rsvp';

export default class CourseVisualizeSessionTypesRoute extends Route {
  @service session;
  @service store;
  @service dataLoader;

  titleToken = 'general.coursesAndSessions';

  async model(params) {
    return this.dataLoader.loadCourse(params.course_id);
  }

  async afterModel(course) {
    const sessions = (await course.sessions).toArray();
    return await map(sessions.toArray(), (s) => s.sessionType);
  }

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }
}
