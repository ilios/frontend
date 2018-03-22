import EmberObject from '@ember/object';
import DashboardControllerMixin from 'ilios-common/mixins/dashboard-controller';
import { module, test } from 'qunit';

module('Unit | Mixin | dashboard controller', function() {
  // Replace this with your real tests.
  test('it works', function(assert) {
    let DashboardControllerObject = EmberObject.extend(DashboardControllerMixin);
    let subject = DashboardControllerObject.create();
    assert.ok(subject);
  });
});
