import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/course-visualize-session-types';

module('Integration | Component | course-visualize-session-types', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    const sessionType1 = this.server.create('session-type', {
      title: 'Standalone',
      school,
    });
    const sessionType2 = this.server.create('session-type', {
      title: 'Campaign',
      school,
    });
    const course = this.server.create('course', { year: 2021, school });
    const session1 = this.server.create('session', {
      title: 'Berkeley Investigations',
      course,
      sessionType: sessionType1,
    });
    const session2 = this.server.create('session', {
      title: 'The San Leandro Horror',
      course,
      sessionType: sessionType2,
    });
    this.server.create('offering', {
      session: session1,
      startDate: new Date('2019-12-08T12:00:00'),
      endDate: new Date('2019-12-08T17:00:00'),
    });
    this.server.create('offering', {
      session: session1,
      startDate: new Date('2019-12-21T12:00:00'),
      endDate: new Date('2019-12-21T17:30:00'),
    });
    this.server.create('offering', {
      session: session2,
      startDate: new Date('2019-12-05T18:00:00'),
      endDate: new Date('2019-12-05T21:00:00'),
    });
    this.courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
  });

  test('it renders', async function (assert) {
    this.set('course', this.courseModel);
    await render(hbs`<CourseVisualizeSessionTypes @model={{this.course}} />`);
    assert.strictEqual(component.title, 'course 0 2021');
    assert.strictEqual(component.title, 'course 0 2021');
    await waitFor('.loaded');
    await waitFor('svg .bars');
    assert.strictEqual(component.sessionTypesChart.chart.bars.length, 2);
    assert.strictEqual(component.sessionTypesChart.chart.labels.length, 2);
    assert.strictEqual(component.sessionTypesChart.chart.labels[0].text, 'Campaign: 180 Minutes');
    assert.strictEqual(component.sessionTypesChart.chart.labels[1].text, 'Standalone: 630 Minutes');
  });

  test('course year is shown as range if applicable by configuration', async function (assert) {
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
        },
      };
    });
    this.set('course', this.courseModel);
    await render(hbs`<CourseVisualizeSessionTypes @model={{this.course}} />`);
    assert.strictEqual(component.title, 'course 0 2021 - 2022');
  });

  test('filter works', async function (assert) {
    this.set('course', this.courseModel);
    await render(hbs`<CourseVisualizeSessionTypes @model={{this.course}} />`);
    //let the chart animations finish
    await waitFor('.loaded');
    await waitFor('svg .bars');
    assert.strictEqual(component.title, 'course 0 2021');
    assert.strictEqual(component.sessionTypesChart.chart.bars.length, 2);
    assert.strictEqual(component.sessionTypesChart.chart.labels.length, 2);
    assert.strictEqual(component.sessionTypesChart.chart.labels[0].text, 'Campaign: 180 Minutes');
    assert.strictEqual(component.sessionTypesChart.chart.labels[1].text, 'Standalone: 630 Minutes');
    await component.filter.set('Campaign');
    assert.strictEqual(component.sessionTypesChart.chart.bars.length, 1);
    assert.strictEqual(component.sessionTypesChart.chart.labels.length, 1);
    assert.strictEqual(component.sessionTypesChart.chart.labels[0].text, 'Campaign: 180 Minutes');
  });

  test('breadcrumb', async function (assert) {
    this.set('course', this.courseModel);

    await render(hbs`<CourseVisualizeSessionTypes @model={{this.course}} />`);

    assert.strictEqual(component.breadcrumb.crumbs.length, 3);
    assert.strictEqual(component.breadcrumb.crumbs[0].text, 'course 0');
    assert.strictEqual(component.breadcrumb.crumbs[0].link, '/courses/1');
    assert.strictEqual(component.breadcrumb.crumbs[1].text, 'Visualizations');
    assert.strictEqual(component.breadcrumb.crumbs[1].link, '/data/courses/1');
    assert.strictEqual(component.breadcrumb.crumbs[2].text, 'Session Types');
  });
});
