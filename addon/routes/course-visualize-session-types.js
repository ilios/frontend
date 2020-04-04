import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { all, map } from 'rsvp';

export default class CourseVisualizeSessionTypesRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service store;

  titleToken = 'general.coursesAndSessions';

  async afterModel(course) {
    const sessions = (await course.sessions).toArray();
    return await all([
      map(sessions.toArray(), s => s.sessionType),
      map(sessions.toArray(), s => s.totalSumDuration),
    ]);
  }
}
