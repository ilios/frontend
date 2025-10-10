import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render, waitFor } from '@ember/test-helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { component } from 'ilios-common/page-objects/components/course/visualize-session-type';
import VisualizeSessionType from 'ilios-common/components/course/visualize-session-type';

module('Integration | Component | course/visualize-session-type', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    const vocabulary = this.server.create('vocabulary', { school });
    const term1 = this.server.create('term', { title: 'lorem', vocabulary });
    const term2 = this.server.create('term', { title: 'ipsum', vocabulary });
    const course = this.server.create('course', { year: 2021, school });
    const session = this.server.create('session', { course, terms: [term1, term2] });
    const sessionType = this.server.create('session-type', { school, sessions: [session] });
    this.server.create('offering', {
      session: session,
      startDate: new Date('2019-12-08T12:00:00'),
      endDate: new Date('2019-12-08T17:00:00'),
    });
    this.sessionTypeModel = await this.owner
      .lookup('service:store')
      .findRecord('session-type', sessionType.id);
    this.courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
  });

  test('it renders', async function (assert) {
    this.set('model', { course: this.courseModel, sessionType: this.sessionTypeModel });

    await render(<template><VisualizeSessionType @model={{this.model}} /></template>);

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
    this.set('model', { course: this.courseModel, sessionType: this.sessionTypeModel });

    await render(<template><VisualizeSessionType @model={{this.model}} /></template>);

    assert.strictEqual(component.title, 'course 0 2021 - 2022');
  });

  test('filter works', async function (assert) {
    this.set('model', { course: this.courseModel, sessionType: this.sessionTypeModel });
    await render(<template><VisualizeSessionType @model={{this.model}} /></template>);
    // let the chart animations finish
    await waitFor('.loaded');
    await waitFor('svg .bars');
    assert.strictEqual(component.title, 'course 0 2021');
    assert.strictEqual(component.sessionTypeChart.chart.bars.length, 2);
    assert.strictEqual(component.sessionTypeChart.chart.labels.length, 2);
    assert.strictEqual(
      component.sessionTypeChart.chart.labels[0].text,
      'Vocabulary 1 - lorem\u200b',
    );
    assert.strictEqual(
      component.sessionTypeChart.chart.labels[1].text,
      'Vocabulary 1 - ipsum\u200b',
    );
    assert.strictEqual(component.sessionTypeChart.dataTable.rows.length, 2);
    assert.strictEqual(
      component.sessionTypeChart.dataTable.rows[0].vocabularyTerm,
      'Vocabulary 1 - ipsum',
    );
    assert.strictEqual(
      component.sessionTypeChart.dataTable.rows[1].vocabularyTerm,
      'Vocabulary 1 - lorem',
    );
    await component.filter.set('lorem');
    assert.strictEqual(component.sessionTypeChart.chart.bars.length, 1);
    assert.strictEqual(component.sessionTypeChart.chart.labels.length, 1);
    assert.strictEqual(
      component.sessionTypeChart.chart.labels[0].text,
      'Vocabulary 1 - lorem\u200b',
    );
    assert.strictEqual(component.sessionTypeChart.dataTable.rows.length, 1);
    assert.strictEqual(
      component.sessionTypeChart.dataTable.rows[0].vocabularyTerm,
      'Vocabulary 1 - lorem',
    );
  });

  test('breadcrumb', async function (assert) {
    this.set('model', { course: this.courseModel, sessionType: this.sessionTypeModel });

    await render(<template><VisualizeSessionType @model={{this.model}} /></template>);

    assert.strictEqual(component.breadcrumb.crumbs.length, 4);
    assert.strictEqual(component.breadcrumb.crumbs[0].text, 'course 0');
    assert.strictEqual(component.breadcrumb.crumbs[0].link, '/courses/1');
    assert.strictEqual(component.breadcrumb.crumbs[1].text, 'Visualizations');
    assert.strictEqual(component.breadcrumb.crumbs[1].link, '/data/courses/1');
    assert.strictEqual(component.breadcrumb.crumbs[2].text, 'Session Types');
    assert.strictEqual(component.breadcrumb.crumbs[2].link, '/data/courses/1/session-types');
    assert.strictEqual(component.breadcrumb.crumbs[3].text, 'session type 0');
  });
});
