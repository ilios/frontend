import EmberObject from '@ember/object';
import DashboardRouteMixin from 'ilios-common/mixins/dashboard-route';
import { module, test } from 'qunit';

module('Unit | Mixin | dashboard route');

// Replace this with your real tests.
test('it works', function(assert) {
  let DashboardRouteObject = EmberObject.extend(DashboardRouteMixin);
  let subject = DashboardRouteObject.create();
  assert.ok(subject);
});
