import { service } from '@ember/service';
import Route from '@ember/routing/route';

export default class CourseVisualizeObjectivesRoute extends Route {
  @service store;
  @service dataLoader;
  @service currentUser;

  async model(params) {
    return this.dataLoader.loadCourse(params.course_id);
  }

  async afterModel(course) {
    const sessions = await course.sessions;
    return await Promise.all([course.objectives, ...sessions.map((s) => s.objectives)]);
  }

  beforeModel(transition) {
    this.currentUser.requireNonLearner(transition);
  }
}
