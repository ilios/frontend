import EmberObject from '@ember/object';
import WeeklyeventsControllerMixin from 'ilios-common/mixins/weeklyevents-controller';
import { module, test } from 'qunit';

module('Unit | Mixin | weeklyevents controller', function() {
  // Replace this with your real tests.
  test('it works', function(assert) {
    const WeeklyeventsControllerObject = EmberObject.extend(WeeklyeventsControllerMixin);
    const subject = WeeklyeventsControllerObject.create();
    assert.ok(subject);
  });
});
