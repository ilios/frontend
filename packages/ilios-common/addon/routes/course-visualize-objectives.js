import { service } from '@ember/service';
import Route from '@ember/routing/route';
import { map } from 'rsvp';

export default class CourseVisualizeObjectivesRoute extends Route {
  @service store;
  @service dataLoader;
  @service currentUser;

  async model(params) {
    return this.dataLoader.loadCourse(params.course_id);
  }

  async afterModel(course) {
    const sessions = await course.sessions;
    return await Promise.all([course.objectives, map(sessions, (s) => s.objectives)]);
  }

  beforeModel(transition) {
    this.currentUser.requireNonLearner(transition);
  }
}
