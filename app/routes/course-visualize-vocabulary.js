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
    const vocabulary = await store.find('vocabulary', params.vocabulary_id);

    return { course, vocabulary };
  },
  async afterModel(model) {
    const { course, vocabulary } = model;
    const sessions = await course.get('sessions');
    return await all([
      course.get('school'),
      vocabulary.get('terms'),
      map(sessions.toArray(), s => s.get('terms')),
    ]);
  }
});
