import EmberObject from '@ember/object';
import SessionControllerMixin from 'ilios-common/mixins/session-controller';
import { module, test } from 'qunit';

module('Unit | Mixin | session-controller', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let SessionControllerObject = EmberObject.extend(SessionControllerMixin);
    let subject = SessionControllerObject.create();
    assert.ok(subject);
  });
});
