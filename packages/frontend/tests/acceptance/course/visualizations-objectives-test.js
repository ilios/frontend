import { module, test } from 'qunit';
import { currentURL, waitFor } from '@ember/test-helpers';
import { setupApplicationTest } from 'frontend/tests/helpers';
import page from 'ilios-common/page-objects/course-visualizations-objectives';
import { setupAuthentication } from 'ilios-common';
import percySnapshot from '@percy/ember';

module('Acceptance | course visualizations - objectives', function (hooks) {
  setupApplicationTest(hooks);
  hooks.beforeEach(async function () {
    this.user = await setupAuthentication({}, true);
  });

  test('it renders', async function (assert) {
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
    await page.visit({ courseId: course.id });
    assert.strictEqual(currentURL(), '/data/courses/1/objectives');
    assert.strictEqual(page.root.title, 'course 0 2021');
    assert.strictEqual(page.root.breadcrumb.crumbs.length, 3);
    assert.strictEqual(page.root.breadcrumb.crumbs[0].text, 'course 0');
    assert.strictEqual(page.root.breadcrumb.crumbs[0].link, '/courses/1');
    assert.strictEqual(page.root.breadcrumb.crumbs[1].text, 'Visualizations');
    assert.strictEqual(page.root.breadcrumb.crumbs[1].link, '/data/courses/1');
    assert.strictEqual(page.root.breadcrumb.crumbs[2].text, 'Objectives');
    // wait for charts to load
    await waitFor('.loaded');
    await waitFor('svg .chart');
    await percySnapshot(assert);
    assert.strictEqual(page.root.objectivesChart.chart.slices.length, 2);
    assert.ok(page.root.objectivesChart.chart.slices[0].label.startsWith('77.8%'));
    assert.strictEqual(
      page.root.objectivesChart.chart.slices[0].description,
      'course objective 0 - 630 Minutes',
    );
    assert.ok(page.root.objectivesChart.chart.slices[1].label.startsWith('22.2%'));
    assert.strictEqual(
      page.root.objectivesChart.chart.slices[1].description,
      'course objective 1 - 180 Minutes',
    );
    assert.notOk(page.root.objectivesChart.unlinkedObjectives.isPresent);
    assert.strictEqual(page.root.objectivesChart.untaughtObjectives.items.length, 1);
    assert.strictEqual(
      page.root.objectivesChart.untaughtObjectives.items[0].text,
      'course objective 2',
    );
    assert.strictEqual(page.root.objectivesChart.dataTable.rows.length, 3);
  });
});
