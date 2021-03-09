import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class SessionTypeVisualizeVocabulariesRoute extends Route {
  @service store;
  @service session;

  _dataLoadingPromise = null;

  async beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model(params) {
    return this.loadModel(params.session_type_id);
  }

  async afterModel(sessionType) {
    return this.loadModel(sessionType.id);
  }

  async loadModel(sessionTypeId) {
    if (!this._dataLoadingPromise) {
      this._dataLoadingPromise = this.store.findRecord('session-type', sessionTypeId, {
        include: 'sessions.terms.vocabulary,sessions.course.terms.vocabulary',
        reload: true,
      });
    }

    return await this._dataLoadingPromise;
  }
}
