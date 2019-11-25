import EmberObject from '@ember/object';
import CourseVisualizeVocabulariesRouteMixin from 'ilios-common/mixins/course-visualize-vocabularies-route';
import { module, test } from 'qunit';

module('Unit | Mixin | course-visualize-vocabularies-route', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    const CourseVisualizeVocabulariesRouteObject = EmberObject.extend(CourseVisualizeVocabulariesRouteMixin);
    const subject = CourseVisualizeVocabulariesRouteObject.create();
    assert.ok(subject);
  });
});
