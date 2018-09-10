import EmberObject from '@ember/object';
import CourseVisualizeSessionTypesRouteMixin from 'ilios-common/mixins/course-visualize-session-types-route';
import { module, test } from 'qunit';

module('Unit | Mixin | course-visualize-session-types-route', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let CourseVisualizeSessionTypesRouteObject = EmberObject.extend(CourseVisualizeSessionTypesRouteMixin);
    let subject = CourseVisualizeSessionTypesRouteObject.create();
    assert.ok(subject);
  });
});
