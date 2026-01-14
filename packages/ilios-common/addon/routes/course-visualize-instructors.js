import { service } from '@ember/service';
import Route from '@ember/routing/route';
import { all, map } from 'rsvp';

export default class CourseVisualizeInstructorsRoute extends Route {
  @service session;
  @service store;
  @service dataLoader;
  @service currentUser;
  @service router;

  async model(params) {
    return this.dataLoader.loadCourse(params.course_id);
  }

  async afterModel(course) {
    const sessions = await course.sessions;
    return await all([
      map(sessions, (s) => s.offerings),
      map(sessions, (s) => s.totalSumDuration),
      map(sessions, (s) => s.allInstructors),
    ]);
  }

  beforeModel(transition) {
    this.currentUser.requireNonLearner(transition);
  }
}
