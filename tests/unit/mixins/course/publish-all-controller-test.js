import EmberObject from '@ember/object';
import CoursePublishAllControllerMixin from 'ilios-common/mixins/course/publish-all-controller';
import { module, test } from 'qunit';

module('Unit | Mixin | course/publish-all-controller', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let CoursePublishAllControllerObject = EmberObject.extend(CoursePublishAllControllerMixin);
    let subject = CoursePublishAllControllerObject.create();
    assert.ok(subject);
  });
});
