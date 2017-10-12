import Component from '@ember/component';
import { timeout, task } from 'ember-concurrency';

export default Component.extend({
  classNames: ['school-session-types-list'],
  deletedSessionTypes: [],
  deleteSessionType: task(function * (sessionType) {
    if (sessionType.get('sessionCount') === 0) {
      this.get('deletedSessionTypes').pushObject(sessionType.get('id'));
      yield timeout(10);
      sessionType.deleteRecord();
      yield sessionType.save();
      this.get('deletedSessionTypes').removeObject(sessionType.get('id'));
    }
  }).drop(),
});
