import EmberObject from '@ember/object';
import CourseRouteMixin from 'ilios-common/mixins/course-route';
import { module, test } from 'qunit';

module('Unit | Mixin | course-route', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    const CourseRouteObject = EmberObject.extend(CourseRouteMixin);
    const subject = CourseRouteObject.create();
    assert.ok(subject);
  });
});
