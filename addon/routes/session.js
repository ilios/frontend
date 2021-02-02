import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class SessionRoute extends Route {
  @service dataLoader;
  @service session;

  async model(params) {
    const course = this.modelFor('course');
    await this.dataLoader.loadCourseSessions(course.id);
    const sessions = await course.sessions;
    return sessions.findBy('id', params.session_id);
  }

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }
}
