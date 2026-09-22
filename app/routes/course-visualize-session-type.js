import { service } from '@ember/service';
import Route from '@ember/routing/route';

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
      ...sessions.map((s) => s.sessionType),
      ...sessions.map((s) => s.terms),
      ...sessions.map((s) => s.totalSumDuration),
    ]);
  }

  beforeModel(transition) {
    this.currentUser.requireNonLearner(transition);
  }
}
