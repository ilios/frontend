import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/course-visualize-vocabulary';

module('Integration | Component | course-visualize-vocabulary', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    const vocabulary = this.server.create('vocabulary', { school });
    const term = this.server.create('term', { vocabulary });
    const course = this.server.create('course', { year: 2021, school, terms: [term] });
    this.courseModel = await this.owner.lookup('service:store').find('course', course.id);
    this.vocabularyModel = await this.owner
      .lookup('service:store')
      .find('vocabulary', vocabulary.id);
  });

  test('it renders', async function (assert) {
    this.set('model', { course: this.courseModel, vocabulary: this.vocabularyModel });

    await render(hbs`<CourseVisualizeVocabulary @model={{this.model}} />`);

    assert.strictEqual(component.title, 'course 0 2021');
  });

  test('course year is shown as range if applicable by configuration', async function (assert) {
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
        },
      };
    });
    this.set('model', { course: this.courseModel, vocabulary: this.vocabularyModel });

    await render(hbs`<CourseVisualizeVocabulary @model={{this.model}} />`);

    assert.strictEqual(component.title, 'course 0 2021 - 2022');
  });

  test('breadcrumb', async function (assert) {
    this.set('model', { course: this.courseModel, vocabulary: this.vocabularyModel });

    await render(hbs`<CourseVisualizeVocabulary @model={{this.model}} />`);

    assert.strictEqual(component.breadcrumb.crumbs.length, 4);
    assert.strictEqual(component.breadcrumb.crumbs[0].text, 'course 0');
    assert.strictEqual(component.breadcrumb.crumbs[0].link, '/courses/1');
    assert.strictEqual(component.breadcrumb.crumbs[1].text, 'Visualizations');
    assert.strictEqual(component.breadcrumb.crumbs[1].link, '/data/courses/1');
    assert.strictEqual(component.breadcrumb.crumbs[2].text, 'Vocabularies');
    assert.strictEqual(component.breadcrumb.crumbs[2].link, '/data/courses/1/vocabularies');
    assert.strictEqual(component.breadcrumb.crumbs[3].text, 'Vocabulary 1');
  });
});
