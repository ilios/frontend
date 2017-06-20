import Ember from 'ember';
import WeeklyeventsControllerMixin from 'ilios-common/mixins/weeklyevents-controller';
import { module, test } from 'qunit';

module('Unit | Mixin | weeklyevents controller');

// Replace this with your real tests.
test('it works', function(assert) {
  let WeeklyeventsControllerObject = Ember.Object.extend(WeeklyeventsControllerMixin);
  let subject = WeeklyeventsControllerObject.create();
  assert.ok(subject);
});
