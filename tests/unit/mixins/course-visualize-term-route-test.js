import EmberObject from '@ember/object';
import CourseVisualizeTermRouteMixin from 'ilios-common/mixins/course-visualize-term-route';
import { module, test } from 'qunit';

module('Unit | Mixin | course-visualize-term-route', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let CourseVisualizeTermRouteObject = EmberObject.extend(CourseVisualizeTermRouteMixin);
    let subject = CourseVisualizeTermRouteObject.create();
    assert.ok(subject);
  });
});
