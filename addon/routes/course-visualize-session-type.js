import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { all, map } from 'rsvp';

export default class CourseVisualizeSessionTypeRoute extends Route {
  @service session;
  @service store;

  titleToken = 'general.coursesAndSessions';

  async model(params) {
    const course = await this.store.findRecord('course', params.course_id);
    const sessionType = await this.store.findRecord('session-type', params['session-type_id']);

    return { course, sessionType };
  }

  async afterModel({ course }) {
    const sessions = (await course.sessions).toArray();
    return await all([
      map(sessions, (s) => s.sessionType),
      map(sessions, (s) => s.terms),
      map(sessions, (s) => s.totalSumDuration),
    ]);
  }

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }
}
