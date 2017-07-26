import Ember from 'ember';

const { Route, RSVP, inject } = Ember;
const { all } = RSVP;
const { service } = inject;

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

    return all([
      store.query('session', {filters: {course}, limit: 1000}),
      store.query('offering', {filters: {courses}, limit: 1000}),
      store.query('ilm-session', {filters: {courses}, limit: 1000}),
      store.query('objective', {filters: {courses}, limit: 1000}),
      store.query('objective', {filters: {sessions}, limit: 1000}),
    ]);
  }
});
