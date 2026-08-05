import { service } from '@ember/service';
import Route from '@ember/routing/route';
import { map } from 'rsvp';

export default class CourseVisualizeSessionTypeRoute extends Route {
  @service store;
  @service currentUser;

  async model(params) {
    const course = await this.store.findRecord('course', params.course_id);
    const sessionType = await this.store.findRecord('session-type', params['session-type_id']);

    return { course, sessionType };
  }

  async afterModel({ course }) {
    const sessions = await course.sessions;
    return await Promise.all([
      map(sessions, (s) => s.sessionType),
      map(sessions, (s) => s.terms),
      map(sessions, (s) => s.totalSumDuration),
    ]);
  }

  beforeModel(transition) {
    this.currentUser.requireNonLearner(transition);
  }
}
