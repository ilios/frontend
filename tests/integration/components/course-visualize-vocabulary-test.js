import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render, waitFor } from '@ember/test-helpers';
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
    const term1 = this.server.create('term', { vocabulary });
    const term2 = this.server.create('term', { vocabulary });
    const course = this.server.create('course', { year: 2021, school });
    const session1 = this.server.create('session', {
      course,
      terms: [term1],
    });
    const session2 = this.server.create('session', {
      course,
      terms: [term2],
    });
    this.server.create('ilmSession', {
      session: session1,
      hours: 2.5,
    });
    this.server.create('offering', {
      session: session2,
      startDate: new Date('2022-07-20T09:00:00'),
      endDate: new Date('2022-07-20T10:00:00'),
    });
    this.courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);
  });

  test('it renders', async function (assert) {
    this.set('model', { course: this.courseModel, vocabulary: this.vocabularyModel });

    await render(hbs`<CourseVisualizeVocabulary @model={{this.model}} />`);

    assert.strictEqual(component.vocabularyTitle, 'Vocabulary 1');
    assert.strictEqual(component.courseTitle.text, 'course 0 2021');
    assert.strictEqual(component.courseTitle.link, '/courses/1');
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

    assert.strictEqual(component.courseTitle.text, 'course 0 2021 - 2022');
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

  test('chart', async function (assert) {
    this.set('model', { course: this.courseModel, vocabulary: this.vocabularyModel });

    await render(hbs`<CourseVisualizeVocabulary @model={{this.model}} />`);
    // wait for charts to load
    await waitFor('.loaded');
    await waitFor('svg .bars');
    assert.strictEqual(component.termsChart.chart.bars.length, 2);
    assert.strictEqual(component.termsChart.chart.labels.length, 2);
    assert.strictEqual(component.termsChart.chart.labels[0].text, 'term 1: 60 Minutes');
    assert.strictEqual(component.termsChart.chart.labels[1].text, 'term 0: 150 Minutes');
  });
});
