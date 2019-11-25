import EmberObject from '@ember/object';
import DashboardRouteMixin from 'ilios-common/mixins/dashboard-route';
import { module, test } from 'qunit';

module('Unit | Mixin | dashboard route', function() {
  // Replace this with your real tests.
  test('it works', function(assert) {
    const DashboardRouteObject = EmberObject.extend(DashboardRouteMixin);
    const subject = DashboardRouteObject.create();
    assert.ok(subject);
  });
});
