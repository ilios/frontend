import EmberObject from '@ember/object';
import CourseVisualizeInstructorRouteMixin from 'ilios-common/mixins/course-visualize-instructor-route';
import { module, test } from 'qunit';

module('Unit | Mixin | course-visualize-instructor-route', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let CourseVisualizeInstructorRouteObject = EmberObject.extend(CourseVisualizeInstructorRouteMixin);
    let subject = CourseVisualizeInstructorRouteObject.create();
    assert.ok(subject);
  });
});
