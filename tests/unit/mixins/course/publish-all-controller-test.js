import EmberObject from '@ember/object';
import CoursePublishAllControllerMixin from 'ilios-common/mixins/course/publish-all-controller';
import { module, test } from 'qunit';

module('Unit | Mixin | course/publish-all-controller', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    const CoursePublishAllControllerObject = EmberObject.extend(CoursePublishAllControllerMixin);
    const subject = CoursePublishAllControllerObject.create();
    assert.ok(subject);
  });
});
