import EmberObject from '@ember/object';
import CourseVisualizeVocabularyRouteMixin from 'ilios-common/mixins/course-visualize-vocabulary-route';
import { module, test } from 'qunit';

module('Unit | Mixin | course-visualize-vocabulary-route', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    const CourseVisualizeVocabularyRouteObject = EmberObject.extend(CourseVisualizeVocabularyRouteMixin);
    const subject = CourseVisualizeVocabularyRouteObject.create();
    assert.ok(subject);
  });
});
