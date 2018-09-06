import EmberObject from '@ember/object';
import PrintCourseRouteMixin from 'ilios-common/mixins/print-course-route';
import { module, test } from 'qunit';

module('Unit | Mixin | print-course-route', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let PrintCourseRouteObject = EmberObject.extend(PrintCourseRouteMixin);
    let subject = PrintCourseRouteObject.create();
    assert.ok(subject);
  });
});
