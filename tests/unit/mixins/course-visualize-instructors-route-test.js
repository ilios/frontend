import EmberObject from '@ember/object';
import CourseVisualizeInstructorsRouteMixin from 'ilios-common/mixins/course-visualize-instructors-route';
import { module, test } from 'qunit';

module('Unit | Mixin | course-visualize-instructors-route', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let CourseVisualizeInstructorsRouteObject = EmberObject.extend(CourseVisualizeInstructorsRouteMixin);
    let subject = CourseVisualizeInstructorsRouteObject.create();
    assert.ok(subject);
  });
});
