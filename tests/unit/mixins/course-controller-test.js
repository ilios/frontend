import EmberObject from '@ember/object';
import CourseControllerMixin from 'ilios-common/mixins/course-controller';
import { module, test } from 'qunit';

module('Unit | Mixin | course-controller', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let CourseControllerObject = EmberObject.extend(CourseControllerMixin);
    let subject = CourseControllerObject.create();
    assert.ok(subject);
  });
});
