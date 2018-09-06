import EmberObject from '@ember/object';
import CourseMaterialsControllerMixin from 'ilios-common/mixins/course-materials-controller';
import { module, test } from 'qunit';

module('Unit | Mixin | course-materials', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let CourseMaterialsObject = EmberObject.extend(CourseMaterialsControllerMixin);
    let subject = CourseMaterialsObject.create();
    assert.ok(subject);
  });
});
