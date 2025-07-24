import { service } from '@ember/service';
import Route from '@ember/routing/route';
import { all, map } from 'rsvp';

export default class CourseVisualizeVocabularyRoute extends Route {
  @service session;
  @service store;
  @service currentUser;
  @service router;

  titleToken = 'general.coursesAndSessions';

  async model(params) {
    const course = await this.store.findRecord('course', params.course_id);
    const vocabulary = await this.store.findRecord('vocabulary', params.vocabulary_id);

    return { course, vocabulary };
  }

  async afterModel(model) {
    const { course, vocabulary } = model;
    const sessions = await course.sessions;
    return await all([course.get('school'), vocabulary.terms, map(sessions, (s) => s.terms)]);
  }

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
    if (this.session.isAuthenticated && !this.currentUser.performsNonLearnerFunction) {
      this.router.replaceWith('/four-oh-four');
    }
  }
}
