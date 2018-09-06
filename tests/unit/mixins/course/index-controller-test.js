import EmberObject from '@ember/object';
import CourseIndexControllerMixin from 'ilios-common/mixins/course/index-controller';
import { module, test } from 'qunit';

module('Unit | Mixin | course/index-controller', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let CourseIndexControllerObject = EmberObject.extend(CourseIndexControllerMixin);
    let subject = CourseIndexControllerObject.create();
    assert.ok(subject);
  });
});
