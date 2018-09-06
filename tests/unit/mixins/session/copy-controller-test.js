import EmberObject from '@ember/object';
import SessionCopyControllerMixin from 'ilios-common/mixins/session/copy-controller';
import { module, test } from 'qunit';

module('Unit | Mixin | session/copy-controller', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let SessionCopyControllerObject = EmberObject.extend(SessionCopyControllerMixin);
    let subject = SessionCopyControllerObject.create();
    assert.ok(subject);
  });
});
