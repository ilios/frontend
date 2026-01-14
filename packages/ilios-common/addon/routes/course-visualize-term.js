import { service } from '@ember/service';
import Route from '@ember/routing/route';
import { all, map } from 'rsvp';

export default class CourseVisualizeTermRoute extends Route {
  @service session;
  @service store;
  @service currentUser;
  @service router;

  async model(params) {
    const course = await this.store.findRecord('course', params.course_id);
    const term = await this.store.findRecord('term', params.term_id);

    return { course, term };
  }

  async afterModel({ course, term }) {
    const sessions = await course.sessions;
    return await all([
      term.vocabulary,
      map(sessions, (s) => s.sessionType),
      map(sessions, (s) => s.totalSumDuration),
    ]);
  }

  beforeModel(transition) {
    this.currentUser.requireNonLearner(transition);
  }
}
