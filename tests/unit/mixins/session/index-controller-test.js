import EmberObject from '@ember/object';
import SessionIndexControllerMixin from 'ilios-common/mixins/session/index-controller';
import { module, test } from 'qunit';

module('Unit | Mixin | session/index-controller', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    const SessionIndexControllerObject = EmberObject.extend(SessionIndexControllerMixin);
    const subject = SessionIndexControllerObject.create();
    assert.ok(subject);
  });
});
