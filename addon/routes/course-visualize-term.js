import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { all, map } from 'rsvp';

export default class CourseVisualizeTermRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service store;

  titleToken = 'general.coursesAndSessions';

  async model(params) {
    const course = await this.store.find('course', params.course_id);
    const term = await this.store.find('term', params.term_id);

    return { course, term };
  }

  async afterModel({ course, term }) {
    const sessions = (await course.sessions).toArray();
    return await all([
      term.vocabulary,
      map(sessions, s => s.sessionType),
      map(sessions, s => s.totalSumDuration),
    ]);
  }
}
