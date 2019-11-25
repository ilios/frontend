import EmberObject from '@ember/object';
import SessionCopyRouteMixin from 'ilios-common/mixins/session/copy-route';
import { module, test } from 'qunit';

module('Unit | Mixin | session/copy-route', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    const SessionCopyRouteObject = EmberObject.extend(SessionCopyRouteMixin);
    const subject = SessionCopyRouteObject.create();
    assert.ok(subject);
  });
});
