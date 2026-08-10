import { service } from '@ember/service';
import Route from '@ember/routing/route';

export default class CourseVisualizeInstructorRoute extends Route {
  @service store;
  @service currentUser;

  async model(params) {
    const course = await this.store.findRecord('course', params.course_id);
    const user = await this.store.findRecord('user', params.user_id);
    return { course, user };
  }

  async afterModel({ course }) {
    const sessions = await course.sessions;
    return await Promise.all([course.school, ...sessions.map((s) => s.sessionType)]);
  }

  beforeModel(transition) {
    this.currentUser.requireNonLearner(transition);
  }
}
