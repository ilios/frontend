import { module, test } from 'qunit';
import { currentURL, waitFor } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import page from 'ilios-common/page-objects/course-visualizations-objectives';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupAuthentication } from 'ilios-common';

module('Acceptance | course visualizations - objectives', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.user = await setupAuthentication();
  });

  test('it renders', async function (assert) {
    const school = this.server.create('school');
    const course = this.server.create('course', { year: 2021, school });
    const courseObjectives = this.server.createList('courseObjective', 3, {
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
    this.server.create('sessionObjective', {
      session: session1,
      courseObjectives: [courseObjectives[0]],
    });
    this.server.create('sessionObjective', {
      session: session2,
      courseObjectives: [courseObjectives[1]],
    });
    this.server.create('sessionObjective', {
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
    assert.strictEqual(page.root.objectivesChart.chart.slices.length, 2);
    assert.strictEqual(page.root.objectivesChart.chart.slices[0].text, '77.8%');
    assert.strictEqual(page.root.objectivesChart.chart.slices[1].text, '22.2%');
    assert.notOk(page.root.objectivesChart.unlinkedObjectives.isPresent);
    assert.strictEqual(page.root.objectivesChart.untaughtObjectives.items.length, 1);
    assert.strictEqual(
      page.root.objectivesChart.untaughtObjectives.items[0].text,
      'course objective 2'
    );
  });
});
