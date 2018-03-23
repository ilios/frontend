import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

const { all, map } = RSVP;

export default Route.extend(AuthenticatedRouteMixin, {
  store: service(),
  titleToken: 'general.coursesAndSessions',
  async model(params) {
    const store = this.get('store');
    const sessionType = await store.find('session-type', params.session_type_id);
    const vocabulary = await store.find('vocabulary', params.vocabulary_id);

    return { sessionType, vocabulary };
  },
  async afterModel(model) {
    const { sessionType, vocabulary } = model;
    const sessions = await sessionType.get('sessions');
    return await all([
      sessionType.get('school'),
      vocabulary.get('terms'),
      map(sessions.toArray(), s => s.get('terms')),
      map(sessions.toArray(), s => s.get('course')),
    ]);
  }
});
