import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

const { all, map } = RSVP;

export default Route.extend(AuthenticatedRouteMixin, {
  store: service(),
  titleToken: 'general.coursesAndSessions',
  async afterModel(course){
    const sessions = await course.get('sessions');
    return await all([
      course.get('objectives'),
      map(sessions.toArray(), s => s.get('objectives')),
      map(sessions.toArray(), s => s.get('offerings')),
    ]);
  }
});
