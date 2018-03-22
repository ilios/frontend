import EmberObject from '@ember/object';
import WeeklyeventsControllerMixin from 'ilios-common/mixins/weeklyevents-controller';
import { module, test } from 'qunit';

module('Unit | Mixin | weeklyevents controller', function() {
  // Replace this with your real tests.
  test('it works', function(assert) {
    let WeeklyeventsControllerObject = EmberObject.extend(WeeklyeventsControllerMixin);
    let subject = WeeklyeventsControllerObject.create();
    assert.ok(subject);
  });
});
