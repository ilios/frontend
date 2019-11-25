import EmberObject from '@ember/object';
import SessionIndexRouteMixin from 'ilios-common/mixins/session/index-route';
import { module, test } from 'qunit';

module('Unit | Mixin | session/index-route', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    const SessionIndexRouteObject = EmberObject.extend(SessionIndexRouteMixin);
    const subject = SessionIndexRouteObject.create();
    assert.ok(subject);
  });
});
