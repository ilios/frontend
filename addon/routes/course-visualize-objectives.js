import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { all, map } from 'rsvp';

export default class CourseVisualizeObjectivesRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service store;

  titleToken = 'general.coursesAndSessions';

  async afterModel(course) {
    const sessions = (await course.sessions).toArray();
    return await all([
      course.get('objectives'),
      map(sessions, s => s.objectives),
      map(sessions, s => s.totalSumDuration),
    ]);
  }
}
