import EmberObject from '@ember/object';
import CourseVisualizeObjectivesRouteMixin from 'ilios-common/mixins/course-visualize-objectives-route';
import { module, test } from 'qunit';

module('Unit | Mixin | course-visualize-objectives-route', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let CourseVisualizeObjectivesRouteObject = EmberObject.extend(CourseVisualizeObjectivesRouteMixin);
    let subject = CourseVisualizeObjectivesRouteObject.create();
    assert.ok(subject);
  });
});
