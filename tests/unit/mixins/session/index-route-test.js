import EmberObject from '@ember/object';
import SessionIndexRouteMixin from 'ilios-common/mixins/session/index-route';
import { module, test } from 'qunit';

module('Unit | Mixin | session/index-route', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let SessionIndexRouteObject = EmberObject.extend(SessionIndexRouteMixin);
    let subject = SessionIndexRouteObject.create();
    assert.ok(subject);
  });
});
