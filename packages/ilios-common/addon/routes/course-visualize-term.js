import { service } from '@ember/service';
import Route from '@ember/routing/route';
import { all, map } from 'rsvp';

import { findRecord } from '@ember-data/legacy-compat/builders';

export default class CourseVisualizeTermRoute extends Route {
  @service session;
  @service store;
  @service currentUser;
  @service router;

  titleToken = 'general.coursesAndSessions';

  async model(params) {
    const {
      content: course
    } = await this.store.request(findRecord('course', params.course_id));
    const {
      content: term
    } = await this.store.request(findRecord('term', params.term_id));

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
    this.session.requireAuthentication(transition, 'login');
    if (!this.currentUser.performsNonLearnerFunction) {
      this.router.replaceWith('/four-oh-four');
    }
  }
}
