import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render, waitFor } from '@ember/test-helpers';
import { setupMSW } from 'ilios-common/msw';
import { component } from 'ilios-common/page-objects/components/course/visualize-instructors';
import VisualizeInstructors from 'ilios-common/components/course/visualize-instructors';

module('Integration | Component | course/visualize-instructors', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  test('it renders', async function (assert) {
    const school = await this.server.create('school');
    const instructor1 = await this.server.create('user', { displayName: 'Marie' });
    const instructor2 = await this.server.create('user', { displayName: 'Daisy' });
    const instructor3 = await this.server.create('user', { displayName: 'Duke' });
    const instructor4 = await this.server.create('user', {
      displayName: 'William',
    });
    const course = await this.server.create('course', { year: 2021, school });
    const session1 = await this.server.create('session', {
      title: 'Berkeley Investigations',
      course,
    });
    const session2 = await this.server.create('session', {
      title: 'The San Leandro Horror',
      course,
    });
    await this.server.create('offering', {
      session: session1,
      startDate: '2019-12-08T12:00:00',
      endDate: '2019-12-08T17:00:00',
      instructors: [instructor1],
    });
    await this.server.create('offering', {
      session: session1,
      startDate: '2019-12-21T12:00:00',
      endDate: '2019-12-21T17:30:00',
      instructors: [instructor1, instructor4],
    });
    await this.server.create('offering', {
      session: session2,
      startDate: '2019-12-05T18:00:00',
      endDate: '2019-12-05T21:00:00',
      instructors: [instructor1, instructor2, instructor3, instructor4],
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);

    await render(<template><VisualizeInstructors @model={{this.course}} /></template>);
    assert.strictEqual(component.title, 'course 0 2021');
    //let the chart animations finish
    await waitFor('.loaded');
    await waitFor('svg .bars');
    assert.strictEqual(component.instructorsChart.chart.bars.length, 4);
    assert.strictEqual(component.instructorsChart.chart.labels.length, 4);
    assert.strictEqual(component.instructorsChart.chart.labels[0].text, 'Daisy\u200b');
    assert.strictEqual(component.instructorsChart.chart.labels[1].text, 'Duke\u200b');
    assert.strictEqual(component.instructorsChart.chart.labels[2].text, 'William\u200b');
    assert.strictEqual(component.instructorsChart.chart.labels[3].text, 'Marie\u200b');
  });

  test('filter works', async function (assert) {
    const school = await this.server.create('school');
    const course = await this.server.create('course', { year: 2021, school });
    const session = await this.server.create('session', { course });
    const instructor1 = await this.server.create('user', { firstName: 'foo' });
    const instructor2 = await this.server.create('user', { firstName: 'bar' });
    await this.server.create('offering', {
      session,
      startDate: '2021-03-01T12:00:00',
      endDate: '2021-03-02T17:00:00',
      instructors: [instructor1, instructor2],
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);

    await render(<template><VisualizeInstructors @model={{this.course}} /></template>);
    //let the chart animations finish
    await waitFor('.loaded');
    await waitFor('svg .bars');

    assert.strictEqual(component.title, 'course 0 2021');
    assert.strictEqual(component.instructorsChart.chart.bars.length, 2);
    assert.strictEqual(component.instructorsChart.chart.labels.length, 2);
    assert.strictEqual(component.instructorsChart.chart.labels[0].text, 'foo M. Mc0son\u200b');
    assert.strictEqual(component.instructorsChart.chart.labels[1].text, 'bar M. Mc1son\u200b');
    await component.filter.set('foo');
    assert.strictEqual(component.instructorsChart.chart.bars.length, 1);
    assert.strictEqual(component.instructorsChart.chart.labels.length, 1);
    assert.strictEqual(component.instructorsChart.chart.labels[0].text, 'foo M. Mc0son\u200b');
  });

  test('course year is shown as range if applicable by configuration', async function (assert) {
    this.server.get('/application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
        },
      };
    });
    const school = await this.server.create('school');
    const course = await this.server.create('course', { year: 2021, school });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);

    await render(<template><VisualizeInstructors @model={{this.course}} /></template>);

    assert.strictEqual(component.title, 'course 0 2021 - 2022');
  });

  test('breadcrumb', async function (assert) {
    const school = await this.server.create('school');
    const course = await this.server.create('course', { year: 2021, school });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);

    await render(<template><VisualizeInstructors @model={{this.course}} /></template>);

    assert.strictEqual(component.breadcrumb.crumbs.length, 3);
    assert.strictEqual(component.breadcrumb.crumbs[0].text, 'course 0');
    assert.strictEqual(component.breadcrumb.crumbs[0].link, '/courses/1');
    assert.strictEqual(component.breadcrumb.crumbs[1].text, 'Visualizations');
    assert.strictEqual(component.breadcrumb.crumbs[1].link, '/data/courses/1');
    assert.strictEqual(component.breadcrumb.crumbs[2].text, 'Instructors');
  });
});
