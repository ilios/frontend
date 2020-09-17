import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
  store: service(),
  _dataLoadingPromise: null,
  async model(params) {
    return this.loadModel(params.session_type_id);
  },
  async afterModel(sessionType) {
    return this.loadModel(sessionType.id);
  },
  async loadModel(sessionTypeId){
    if (!this._dataLoadingPromise) {
      this._dataLoadingPromise = this.store.findRecord('session-type', sessionTypeId, {
        include: 'sessions.terms.vocabulary,sessions.course.terms.vocabulary',
        reload: true,
      });
    }

    return await this._dataLoadingPromise;
  }
});
