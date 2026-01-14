import { service } from '@ember/service';
import Route from '@ember/routing/route';
import { all, map } from 'rsvp';

export default class CourseVisualizeObjectivesRoute extends Route {
  @service store;
  @service session;
  @service dataLoader;
  @service currentUser;
  @service router;

  async model(params) {
    return this.dataLoader.loadCourse(params.course_id);
  }

  async afterModel(course) {
    const sessions = await course.sessions;
    return await all([course.objectives, map(sessions, (s) => s.objectives)]);
  }

  beforeModel(transition) {
    this.currentUser.requireNonLearner(transition);
  }
}
