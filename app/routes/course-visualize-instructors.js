import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { all, map } from 'rsvp';

export default Route.extend(AuthenticatedRouteMixin, {
  store: service(),
  titleToken: 'general.coursesAndSessions',
  async afterModel(course) {
    const sessions = await course.get('sessions');
    return await all([
      map(sessions.toArray(), s => s.get('offerings')),
      map(sessions.toArray(), s => s.get('totalSumDuration')),
      map(sessions.toArray(), s => s.get('allInstructors')),
    ]);
  }
});
