import Component from '@ember/component';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
  classNames: ['school-session-types-list'],

  canDelete: false,
  deletedSessionTypes: null,

  init(){
    this._super(...arguments);
    this.set('deletedSessionTypes', []);
  },

  deleteSessionType: task(function* (sessionType) {
    if (sessionType.get('sessionCount') === 0) {
      this.deletedSessionTypes.pushObject(sessionType.get('id'));
      yield timeout(10);
      sessionType.deleteRecord();
      yield sessionType.save();
      this.deletedSessionTypes.removeObject(sessionType.get('id'));
    }
  }).drop()
});
