import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

const { Route, RSVP} = Ember;
const { all, map } = RSVP;

export default Route.extend(AuthenticatedRouteMixin, {
  store: Ember.inject.service(),
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
