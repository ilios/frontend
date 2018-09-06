import EmberObject from '@ember/object';
import CourseRolloverControllerMixin from 'ilios-common/mixins/course/rollover-controller';
import { module, test } from 'qunit';

module('Unit | Mixin | course/rollover-controller', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let CourseRolloverControllerObject = EmberObject.extend(CourseRolloverControllerMixin);
    let subject = CourseRolloverControllerObject.create();
    assert.ok(subject);
  });
});
