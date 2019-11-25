import EmberObject from '@ember/object';
import PrintCourseControllerMixin from 'ilios-common/mixins/print-course-controller';
import { module, test } from 'qunit';

module('Unit | Mixin | print-course-controller', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    const PrintCourseControllerObject = EmberObject.extend(PrintCourseControllerMixin);
    const subject = PrintCourseControllerObject.create();
    assert.ok(subject);
  });
});
