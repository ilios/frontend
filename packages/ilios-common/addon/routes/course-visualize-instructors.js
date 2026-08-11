import { service } from '@ember/service';
import Route from '@ember/routing/route';

export default class CourseVisualizeInstructorsRoute extends Route {
  @service store;
  @service dataLoader;
  @service currentUser;

  async model(params) {
    return this.dataLoader.loadCourse(params.course_id);
  }

  async afterModel(course) {
    const sessions = await course.sessions;
    return await Promise.all([
      ...sessions.map((s) => s.offerings),
      ...sessions.map((s) => s.totalSumDuration),
      ...sessions.map((s) => s.allInstructors),
    ]);
  }

  beforeModel(transition) {
    this.currentUser.requireNonLearner(transition);
  }
}
