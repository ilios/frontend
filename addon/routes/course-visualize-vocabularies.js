import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { all, map } from 'rsvp';

export default class CourseVisualizeVocabulariesRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service store;

  titleToken = 'general.coursesAndSessions';

  async afterModel(course) {
    const sessions = (await course.sessions).toArray();
    return await all([
      course.get('school'),
      map(sessions, s => s.terms),
      map(sessions, s => s.totalSumDuration),
    ]);
  }
}
