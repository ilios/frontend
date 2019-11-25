import EmberObject from '@ember/object';
import CourseVisualizeSessionTypeRouteMixin from 'ilios-common/mixins/course-visualize-session-type-route';
import { module, test } from 'qunit';

module('Unit | Mixin | course-visualize-session-type-route', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    const CourseVisualizeSessionTypeRouteObject = EmberObject.extend(CourseVisualizeSessionTypeRouteMixin);
    const subject = CourseVisualizeSessionTypeRouteObject.create();
    assert.ok(subject);
  });
});
