import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

const { all, map } = RSVP;

export default Route.extend(AuthenticatedRouteMixin, {
  store: service(),
  titleToken: 'general.coursesAndSessions',
  async afterModel(sessionType){
    const sessions = await sessionType.get('sessions');
    return await all([
      sessionType.get('school'),
      map(sessions.toArray(), s => s.get('terms')),
      map(sessions.toArray(), s => s.get('course')),
    ]);
  }
});
