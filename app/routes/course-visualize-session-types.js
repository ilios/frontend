import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class CourseVisualizeSessionTypesRoute extends Route {
  @service store;
  @service dataLoader;
  @service currentUser;

  async model(params) {
    return this.dataLoader.loadCourse(params.course_id);
  }

  async afterModel(course) {
    const sessions = await course.sessions;
    return await Promise.all(sessions.map((s) => s.sessionType));
  }

  beforeModel(transition) {
    this.currentUser.requireNonLearner(transition);
  }
}
