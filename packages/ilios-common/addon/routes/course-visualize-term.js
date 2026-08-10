import { service } from '@ember/service';
import Route from '@ember/routing/route';

export default class CourseVisualizeTermRoute extends Route {
  @service store;
  @service currentUser;

  async model(params) {
    const course = await this.store.findRecord('course', params.course_id);
    const term = await this.store.findRecord('term', params.term_id);

    return { course, term };
  }

  async afterModel({ course, term }) {
    const sessions = await course.sessions;
    return await Promise.all([
      term.vocabulary,
      ...sessions.map((s) => s.sessionType),
      ...sessions.map((s) => s.totalSumDuration),
    ]);
  }

  beforeModel(transition) {
    this.currentUser.requireNonLearner(transition);
  }
}
