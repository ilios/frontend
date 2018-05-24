import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { all, map } from 'rsvp';

export default Route.extend(AuthenticatedRouteMixin, {
  store: service(),
  titleToken: 'general.coursesAndSessions',
  async model(params) {
    const store = this.get('store');
    const course = await store.find('course', params.course_id);
    const sessionType = await store.find('session-type', params['session-type_id']);

    return { course, sessionType };
  },
  async afterModel(model) {
    const { course } = model;
    const sessions = await course.get('sessions');
    return await all([
      map(sessions.toArray(), s => s.get('sessionType')),
      map(sessions.toArray(), s => s.get('terms')),
      map(sessions.toArray(), s => s.get('totalSumOfferingsDuration')),
    ]);
  }
});
