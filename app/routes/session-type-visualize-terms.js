/* eslint-disable ember/avoid-leaking-state-in-ember-objects */
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
  store: service(),
  _loadedSessionTypes: {},
  async model(params) {
    return this.loadModel(params.session_type_id, params.vocabulary_id);
  },
  async afterModel({sessionType, vocabulary}) {
    return this.loadModel(sessionType.id, vocabulary.id);
  },
  async loadModel(sessionTypeId, vocabularyId){
    if (!( sessionTypeId in this._loadedSessionTypes)) {
      this._loadedSessionTypes[sessionTypeId] = this.store.findRecord('session-type', sessionTypeId, {
        include: 'school,sessions.terms.vocabulary,sessions.course.terms.vocabulary',
        reload: true,
      });
    }

    return {
      sessionType: await this._loadedSessionTypes[sessionTypeId],
      vocabulary: await this.store.findRecord('vocabulary', vocabularyId),
    };
  }

});
