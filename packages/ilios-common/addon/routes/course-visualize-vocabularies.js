import { service } from '@ember/service';
import Route from '@ember/routing/route';

export default class CourseVisualizeVocabulariesRoute extends Route {
  @service store;
  @service dataLoader;
  @service currentUser;

  async model(params) {
    return this.dataLoader.loadCourse(params.course_id);
  }

  async afterModel(course) {
    const sessions = await course.sessions;
    return await Promise.all([course.school, ...sessions.map((s) => s.terms)]);
  }

  beforeModel(transition) {
    this.currentUser.requireNonLearner(transition);
  }
}
