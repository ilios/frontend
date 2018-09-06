import EmberObject from '@ember/object';
import CourseIndexRouteMixin from 'ilios-common/mixins/course/index-route';
import { module, test } from 'qunit';

module('Unit | Mixin | course/index-route', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let CourseIndexRouteObject = EmberObject.extend(CourseIndexRouteMixin);
    let subject = CourseIndexRouteObject.create();
    assert.ok(subject);
  });
});
