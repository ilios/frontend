import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render, waitFor } from '@ember/test-helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { component } from 'ilios-common/page-objects/components/course/visualize-objectives';
import VisualizeObjectives from 'ilios-common/components/course/visualize-objectives';

module('Integration | Component | course/visualize-objectives', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const school = this.server.create('school');
    const course = this.server.create('course', { year: 2021, school });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);

    await render(<template><VisualizeObjectives @model={{this.course}} /></template>);
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
    const school = this.server.create('school');
    const course = this.server.create('course', { year: 2021, school });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);

    await render(<template><VisualizeObjectives @model={{this.course}} /></template>);

    assert.strictEqual(component.title, 'course 0 2021 - 2022');
  });

  test('breadcrumb', async function (assert) {
    const school = this.server.create('school');
    const course = this.server.create('course', { year: 2021, school });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);

    await render(<template><VisualizeObjectives @model={{this.course}} /></template>);

    assert.strictEqual(component.breadcrumb.crumbs.length, 3);
    assert.strictEqual(component.breadcrumb.crumbs[0].text, 'course 0');
    assert.strictEqual(component.breadcrumb.crumbs[0].link, '/courses/1');
    assert.strictEqual(component.breadcrumb.crumbs[1].text, 'Visualizations');
    assert.strictEqual(component.breadcrumb.crumbs[1].link, '/data/courses/1');
    assert.strictEqual(component.breadcrumb.crumbs[2].text, 'Objectives');
  });

  test('chart', async function (assert) {
    const school = this.server.create('school');
    const course = this.server.create('course', { year: 2021, school });
    const courseObjectives = this.server.createList('course-objective', 3, {
      course,
    });
    const session1 = this.server.create('session', {
      title: 'Berkeley Investigations',
      course,
    });
    const session2 = this.server.create('session', {
      title: 'The San Leandro Horror',
      course,
    });
    const session3 = this.server.create('session', {
      title: 'Empty Session',
      course,
    });
    this.server.create('session-objective', {
      session: session1,
      courseObjectives: [courseObjectives[0]],
    });
    this.server.create('session-objective', {
      session: session2,
      courseObjectives: [courseObjectives[1]],
    });
    this.server.create('session-objective', {
      session: session3,
      courseObjectives: [courseObjectives[2]],
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
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);

    await render(<template><VisualizeObjectives @model={{this.course}} /></template>);

    await waitFor('.loaded');
    await waitFor('svg .slice');

    assert.strictEqual(component.objectivesChart.chart.slices.length, 2);
    assert.ok(component.objectivesChart.chart.slices[0].label.startsWith('77.8%'));
    assert.strictEqual(
      component.objectivesChart.chart.slices[0].description,
      'course objective 0 - 630 Minutes',
    );
    assert.ok(component.objectivesChart.chart.slices[1].label.startsWith('22.2%'));
    assert.strictEqual(
      component.objectivesChart.chart.slices[1].description,
      'course objective 1 - 180 Minutes',
    );
    assert.notOk(component.objectivesChart.unlinkedObjectives.isPresent);
    assert.strictEqual(component.objectivesChart.untaughtObjectives.items.length, 1);
    assert.strictEqual(
      component.objectivesChart.untaughtObjectives.items[0].text,
      'course objective 2',
    );
  });
});
