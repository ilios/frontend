import EmberObject from '@ember/object';
import CourseIndexControllerMixin from 'ilios-common/mixins/course/index-controller';
import { module, test } from 'qunit';

module('Unit | Mixin | course/index-controller', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    const CourseIndexControllerObject = EmberObject.extend(CourseIndexControllerMixin);
    const subject = CourseIndexControllerObject.create();
    assert.ok(subject);
  });
});
