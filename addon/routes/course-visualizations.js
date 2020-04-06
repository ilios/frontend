import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { all } from 'rsvp';

export default class CourseVisualizationsRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service store;

  titleToken = 'general.coursesAndSessions';

  /**
   * Prefetch related data to limit network requests
   */
  afterModel(model) {
    const courses = [model.get('id')];
    const course = model.get('id');
    const sessions = model.hasMany('sessions').ids();
    const existingSessionsInStore = this.store.peekAll('session');
    const existingSessionIds = existingSessionsInStore.mapBy('id');
    const unloadedSessions = sessions.filter(id => !existingSessionIds.includes(id));

    //if we have already loaded all of these sessions we can just proceed normally
    if (unloadedSessions.length === 0) {
      return;
    }

    const promises = [
      this.store.query('session', { filters: { course } }),
      this.store.query('offering', { filters: { courses } }),
      this.store.query('ilm-session', { filters: { courses } }),
      this.store.query('objective', { filters: { courses } }),
    ];
    const maximumSessionLoad = 100;
    if (sessions.length < maximumSessionLoad) {
      promises.pushObject(this.store.query('objective', { filters: { sessions } }));
      promises.pushObject(this.store.query('session-type', { filters: { sessions } }));
      promises.pushObject(this.store.query('term', { filters: { sessions } }));
    } else {
      for (let i = 0; i < sessions.length; i += maximumSessionLoad) {
        const slice = sessions.slice(i, i + maximumSessionLoad);
        promises.pushObject(this.store.query('objective', { filters: { sessions: slice } }));
        promises.pushObject(this.store.query('session-type', { filters: { sessions: slice } }));
        promises.pushObject(this.store.query('term', { filters: { sessions: slice } }));
      }
    }

    return all(promises);
  }
}
