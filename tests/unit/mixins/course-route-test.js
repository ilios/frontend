import EmberObject from '@ember/object';
import CourseRouteMixin from 'ilios-common/mixins/course-route';
import { module, test } from 'qunit';

module('Unit | Mixin | course-route', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let CourseRouteObject = EmberObject.extend(CourseRouteMixin);
    let subject = CourseRouteObject.create();
    assert.ok(subject);
  });
});
