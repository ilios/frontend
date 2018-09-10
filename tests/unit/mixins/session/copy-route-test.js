import EmberObject from '@ember/object';
import SessionCopyRouteMixin from 'ilios-common/mixins/session/copy-route';
import { module, test } from 'qunit';

module('Unit | Mixin | session/copy-route', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let SessionCopyRouteObject = EmberObject.extend(SessionCopyRouteMixin);
    let subject = SessionCopyRouteObject.create();
    assert.ok(subject);
  });
});
