import EmberObject from '@ember/object';
import CourseControllerMixin from 'ilios-common/mixins/course-controller';
import { module, test } from 'qunit';

module('Unit | Mixin | course-controller', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    const CourseControllerObject = EmberObject.extend(CourseControllerMixin);
    const subject = CourseControllerObject.create();
    assert.ok(subject);
  });
});
