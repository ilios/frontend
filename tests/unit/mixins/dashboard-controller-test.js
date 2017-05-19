import Ember from 'ember';
import DashboardControllerMixin from 'ilios-common/mixins/dashboard-controller';
import { module, test } from 'qunit';

module('Unit | Mixin | dashboard controller');

// Replace this with your real tests.
test('it works', function(assert) {
  let DashboardControllerObject = Ember.Object.extend(DashboardControllerMixin);
  let subject = DashboardControllerObject.create();
  assert.ok(subject);
});
