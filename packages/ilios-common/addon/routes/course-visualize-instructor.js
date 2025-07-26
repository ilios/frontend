import { service } from '@ember/service';
import Route from '@ember/routing/route';
import { all, map } from 'rsvp';

export default class CourseVisualizeInstructorRoute extends Route {
  @service session;
  @service store;
  @service currentUser;
  @service router;

  titleToken = 'general.coursesAndSessions';

  async model(params) {
    const course = await this.store.findRecord('course', params.course_id);
    const user = await this.store.findRecord('user', params.user_id);
    return { course, user };
  }

  async afterModel({ course }) {
    return await all([course.school, map(course.sessions, (s) => s.sessionType)]);
  }

  beforeModel(transition) {
    this.currentUser.requireNonLearner(transition);
  }
}
