import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class SessionTypeVisualizeVocabularyRoute extends Route {
  @service store;
  @service session;

  _loadedSessionTypes = {};

  async beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model(params) {
    return this.loadModel(params.session_type_id, params.vocabulary_id);
  }

  async afterModel({ sessionType, vocabulary }) {
    return this.loadModel(sessionType.id, vocabulary.id);
  }

  async loadModel(sessionTypeId, vocabularyId) {
    if (!(sessionTypeId in this._loadedSessionTypes)) {
      this._loadedSessionTypes[sessionTypeId] = this.store.findRecord(
        'session-type',
        sessionTypeId,
        {
          include: 'school,sessions.terms.vocabulary,sessions.course.terms.vocabulary',
          reload: true,
        }
      );
    }

    return {
      sessionType: await this._loadedSessionTypes[sessionTypeId],
      vocabulary: await this.store.findRecord('vocabulary', vocabularyId),
    };
  }
}
