import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { all, map } from 'rsvp';

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
    return await all([
      map(sessions.toArray(), (s) => s.sessionType),
      map(sessions.toArray(), (s) => s.totalSumDuration),
    ]);
  }

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }
}
