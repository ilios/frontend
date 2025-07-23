import { service } from '@ember/service';
import Route from '@ember/routing/route';
import { all, map } from 'rsvp';

import { findRecord } from '@ember-data/legacy-compat/builders';

export default class CourseVisualizeInstructorRoute extends Route {
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
      content: user
    } = await this.store.request(findRecord('user', params.user_id));
    return { course, user };
  }

  async afterModel({ course }) {
    return await all([course.school, map(course.sessions, (s) => s.sessionType)]);
  }

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
    if (!this.currentUser.performsNonLearnerFunction) {
      this.router.replaceWith('/four-oh-four');
    }
  }
}
