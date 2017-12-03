/* eslint ember/order-in-routes: 0 */
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import RSVP from 'rsvp';
const { all } = RSVP;

export default  Route.extend({
  store: service(),
  /**
   * Prefetch related data to limit network requests
  */
  afterModel(model) {
    const store = this.get('store');
    const courses = [model.get('id')];
    const course = model.get('id');
    const sessions = model.hasMany('sessions').ids();
    const existingSessionsInStore = store.peekAll('session');
    const existingSessionIds = existingSessionsInStore.mapBy('id');
    const unloadedSessions = sessions.filter(id => !existingSessionIds.includes(id));

    //if we have already loaded all of these sessions we can just proceed normally
    if (unloadedSessions.length === 0) {
      return;
    }

    let promises = [
      store.query('session', { filters: { course } }),
      store.query('offering', { filters: { courses } }),
      store.query('ilm-session', { filters: { courses } }),
      store.query('objective', { filters: { courses } }),
    ];
    const maximumSessionLoad = 100;
    if (sessions.length < maximumSessionLoad) {
      promises.pushObject(store.query('objective', { filters: { sessions } }));
      promises.pushObject(store.query('session-type', { filters: { sessions } }));
    } else {
      for (let i = 0; i < sessions.length; i += maximumSessionLoad) {
        let slice = sessions.slice(i, i + maximumSessionLoad);
        promises.pushObject(store.query('objective', { filters: { sessions: slice } }));
        promises.pushObject(store.query('session-type', { filters: { sessions: slice } }));
      }
    }

    return all(promises);
  },
  queryParams: {
    sortSessionsBy: {
      replace: true
    },
    filterSessionsBy: {
      replace: true
    },
  }
});
