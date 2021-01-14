import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { inject as service } from '@ember/service';

export default class SessionRoute extends Route.extend(
  AuthenticatedRouteMixin
) {
  @service dataLoader;

  async model(params) {
    const course = this.modelFor('course');
    await this.dataLoader.loadCourseSessions(course.id);
    const sessions = await course.sessions;
    return sessions.findBy('id', params.session_id);
  }
}
