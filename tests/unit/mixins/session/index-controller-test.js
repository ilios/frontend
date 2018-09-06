import EmberObject from '@ember/object';
import SessionIndexControllerMixin from 'ilios-common/mixins/session/index-controller';
import { module, test } from 'qunit';

module('Unit | Mixin | session/index-controller', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let SessionIndexControllerObject = EmberObject.extend(SessionIndexControllerMixin);
    let subject = SessionIndexControllerObject.create();
    assert.ok(subject);
  });
});
