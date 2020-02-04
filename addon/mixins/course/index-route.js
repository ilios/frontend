import Mixin from '@ember/object/mixin';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import { all } from 'rsvp';

export default Mixin.create({
  permissionChecker: service(),
  preserveScroll: service(),
  store: service(),

  canCreateSession: false,
  canUpdateCourse: false,

  beforeModel(transition) {
    const isFromSessionIndex = get(transition, 'from.name') === 'session.index';
    this.preserveScroll.set('shouldScrollDown', isFromSessionIndex);
  },

  /**
   * Prefetch related data to limit network requests
   */
  async afterModel(model) {
    const store = this.get('store');
    const courses = [model.get('id')];
    const course = model.get('id');
    const school = model.belongsTo('school').id();
    const sessions = model.hasMany('sessions').ids();
    const existingSessionsInStore = store.peekAll('session');
    const existingSessionIds = existingSessionsInStore.mapBy('id');
    const unloadedSessions = sessions.filter(id => !existingSessionIds.includes(id));
    await this.fillPermissions(model);

    //if we have already loaded all of these sessions we can just proceed normally
    if (unloadedSessions.length === 0) {
      return;
    }

    const promises = [
      store.query('session', { filters: { course } }),
      store.query('offering', { filters: { courses } }),
      store.query('ilm-session', { filters: { courses } }),
      store.query('objective', { filters: { courses } }),
      store.query('cohort', { filters: { courses } }),
      store.query('programYear', { filters: { courses } }),
      store.query('program', { filters: { courses } }),
      store.query('competency', { filters: { school } }),
    ];
    const maximumSessionLoad = 100;
    if (sessions.length < maximumSessionLoad) {
      promises.pushObject(store.query('session-type', { filters: { sessions } }));
    } else {
      for (let i = 0; i < sessions.length; i += maximumSessionLoad) {
        const slice = sessions.slice(i, i + maximumSessionLoad);
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
    const canUpdateCourse = await permissionChecker.canUpdateCourse(course);
    const canCreateSession = await permissionChecker.canCreateSession(course);

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
  },

  actions: {
    willTransition(transition) {
      this.preserveScroll.set('isListenerOn', false);
      if (transition.targetName !== 'session.index') {
        this.preserveScroll.set('yPos', null);
      }
    }
  }
});
