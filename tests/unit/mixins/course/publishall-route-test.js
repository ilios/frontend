import EmberObject from '@ember/object';
import CoursePublishallRouteMixin from 'ilios-common/mixins/course/publishall-route';
import { module, test } from 'qunit';

module('Unit | Mixin | course/publishall-route', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let CoursePublishallRouteObject = EmberObject.extend(CoursePublishallRouteMixin);
    let subject = CoursePublishallRouteObject.create();
    assert.ok(subject);
  });
});
