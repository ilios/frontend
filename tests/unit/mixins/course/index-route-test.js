import EmberObject from '@ember/object';
import CourseIndexRouteMixin from 'ilios-common/mixins/course/index-route';
import { module, test } from 'qunit';

module('Unit | Mixin | course/index-route', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    const CourseIndexRouteObject = EmberObject.extend(CourseIndexRouteMixin);
    const subject = CourseIndexRouteObject.create();
    assert.ok(subject);
  });
});
