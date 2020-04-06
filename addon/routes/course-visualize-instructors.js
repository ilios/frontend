import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { all, map } from 'rsvp';

export default class CourseVisualizeInstructorsRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service store;

  titleToken = 'general.coursesAndSessions';

  async afterModel(course) {
    const sessions = (await course.sessions).toArray();
    return await all([
      map(sessions, s => s.offerings),
      map(sessions, s => s.totalSumDuration),
      map(sessions, s => s.allInstructors),
    ]);
  }
}
