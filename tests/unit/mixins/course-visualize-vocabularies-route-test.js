import EmberObject from '@ember/object';
import CourseVisualizeVocabulariesRouteMixin from 'ilios-common/mixins/course-visualize-vocabularies-route';
import { module, test } from 'qunit';

module('Unit | Mixin | course-visualize-vocabularies-route', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let CourseVisualizeVocabulariesRouteObject = EmberObject.extend(CourseVisualizeVocabulariesRouteMixin);
    let subject = CourseVisualizeVocabulariesRouteObject.create();
    assert.ok(subject);
  });
});
