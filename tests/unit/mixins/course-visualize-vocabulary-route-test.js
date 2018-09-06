import EmberObject from '@ember/object';
import CourseVisualizeVocabularyRouteMixin from 'ilios-common/mixins/course-visualize-vocabulary-route';
import { module, test } from 'qunit';

module('Unit | Mixin | course-visualize-vocabulary-route', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let CourseVisualizeVocabularyRouteObject = EmberObject.extend(CourseVisualizeVocabularyRouteMixin);
    let subject = CourseVisualizeVocabularyRouteObject.create();
    assert.ok(subject);
  });
});
