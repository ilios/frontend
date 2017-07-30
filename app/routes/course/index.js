import Ember from 'ember';

const { Route, RSVP} = Ember;
const { all } = RSVP;

export default  Route.extend({
  store: Ember.inject.service(),
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

    return all([
      store.query('session', {filters: {course}}),
      store.query('offering', {filters: {courses}}),
      store.query('ilm-session', {filters: {courses}}),
      store.query('objective', {filters: {courses}}),
      store.query('objective', {filters: {sessions}}),
      store.query('session-type', {filters: {sessions}}),
    ]);
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
