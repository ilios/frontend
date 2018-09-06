import EmberObject from '@ember/object';
import CourseVisualizeInstructorsControllerMixin from 'ilios-common/mixins/course-visualize-instructors-controller';
import { module, test } from 'qunit';

module('Unit | Mixin | course-visualize-instructors-controller', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let CourseVisualizeInstructorsControllerObject = EmberObject.extend(CourseVisualizeInstructorsControllerMixin);
    let subject = CourseVisualizeInstructorsControllerObject.create();
    assert.ok(subject);
  });
});
