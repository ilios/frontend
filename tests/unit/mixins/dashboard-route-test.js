import Ember from 'ember';
import DashboardRouteMixin from 'ilios-common/mixins/dashboard-route';
import { module, test } from 'qunit';

module('Unit | Mixin | dashboard route');

// Replace this with your real tests.
test('it works', function(assert) {
  let DashboardRouteObject = Ember.Object.extend(DashboardRouteMixin);
  let subject = DashboardRouteObject.create();
  assert.ok(subject);
});
