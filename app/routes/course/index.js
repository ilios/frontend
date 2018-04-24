/* eslint ember/order-in-routes: 0 */
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { all } from 'rsvp';

import config from 'ilios/config/environment';
const { IliosFeatures: { enforceRelationshipCapabilityPermissions } } = config;

export default  Route.extend({
  store: service(),
  permissionChecker: service(),
  canCreateSession: false,
  canUpdateCourse: false,

  /**
   * Prefetch related data to limit network requests
  */
  async afterModel(model) {
    const store = this.get('store');
    const courses = [model.get('id')];
    const course = model.get('id');
    const sessions = model.hasMany('sessions').ids();
    const existingSessionsInStore = store.peekAll('session');
    const existingSessionIds = existingSessionsInStore.mapBy('id');
    const unloadedSessions = sessions.filter(id => !existingSessionIds.includes(id));
    await this.fillPermissions(model);

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
      promises.pushObject(store.query('session-type', { filters: { sessions } }));
    } else {
      for (let i = 0; i < sessions.length; i += maximumSessionLoad) {
        let slice = sessions.slice(i, i + maximumSessionLoad);
        promises.pushObject(store.query('session-type', { filters: { sessions: slice } }));
      }
    }

    return all(promises);
  },
  setupController(controller, model) {
    this._super(controller, model);
    controller.set('canUpdateCourse', this.get('canUpdateCourse'));
    controller.set('canCreateSession', this.get('canCreateSession'));
  },
  async fillPermissions(course) {
    const permissionChecker = this.get('permissionChecker');
    let canUpdateCourse;
    let canCreateSession;
    if (!enforceRelationshipCapabilityPermissions) {
      canUpdateCourse = !course.get('locked');
      canCreateSession = !course.get('locked');
    } else {
      canUpdateCourse = await permissionChecker.canUpdateCourse(course);
      canCreateSession = await permissionChecker.canCreateSession(course);
    }

    this.set('canUpdateCourse', canUpdateCourse);
    this.set('canCreateSession', canCreateSession);
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
