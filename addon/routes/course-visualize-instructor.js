import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { all, map } from 'rsvp';

export default class CourseVisualizeInstructorRoute extends Route {
  @service session;
  @service store;

  titleToken = 'general.coursesAndSessions';

  async model(params) {
    const course = await this.store.find('course', params.course_id);
    const user = await this.store.find('user', params.user_id);
    return { course, user };
  }

  async afterModel({ course }) {
    const sessions = (await course.sessions).toArray();
    return await all([course.school, map(sessions, (s) => s.sessionType)]);
  }

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }
}
