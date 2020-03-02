import Mixin from '@ember/object/mixin';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import preloadCourse from 'ilios-common/utils/preload-course';

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
    await preloadCourse(this.store, model);
    return this.fillPermissions(model);
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
