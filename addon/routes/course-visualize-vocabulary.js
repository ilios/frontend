import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { all, map } from 'rsvp';

export default class CourseVisualizeVocabularyRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service store;

  titleToken = 'general.coursesAndSessions';

  async model(params) {
    const course = await this.store.find('course', params.course_id);
    const vocabulary = await this.store.find('vocabulary', params.vocabulary_id);

    return { course, vocabulary };
  }

  async afterModel(model) {
    const { course, vocabulary } = model;
    const sessions = (await course.sessions).toArray();
    return await all([
      course.get('school'),
      vocabulary.terms,
      map(sessions, s => s.terms),
      map(sessions, s => s.totalSumDuration),
    ]);
  }
}
