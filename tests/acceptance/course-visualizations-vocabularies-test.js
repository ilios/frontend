import { module, test } from 'qunit';
import { currentURL, waitFor } from '@ember/test-helpers';
import { setupApplicationTest } from 'dummy/tests/helpers';
import page from 'ilios-common/page-objects/course-visualizations-vocabularies';
import { setupAuthentication } from 'ilios-common';
import { DateTime } from 'luxon';

module('Acceptance | course visualizations - vocabularies', function (hooks) {
  setupApplicationTest(hooks);
  hooks.beforeEach(async function () {
    this.user = await setupAuthentication();
  });

  test('it renders', async function (assert) {
    const sessionType = this.server.create('sessionType');
    const vocabulary1 = this.server.create('vocabulary');
    const vocabulary2 = this.server.create('vocabulary');
    const term1 = this.server.create('term', {
      vocabulary: vocabulary1,
    });
    const term2 = this.server.create('term', {
      vocabulary: vocabulary1,
    });
    const term3 = this.server.create('term', {
      vocabulary: vocabulary2,
    });
    const session1 = this.server.create('session', {
      sessionType,
      terms: [term1],
    });
    const session2 = this.server.create('session', {
      sessionType,
      terms: [term2, term3],
    });
    const session3 = this.server.create('session', {
      sessionType,
    });
    this.server.create('ilmSession', {
      session: session3,
      hours: 2,
    });
    this.server.create('offering', {
      startDate: DateTime.fromISO('2022-07-20T09:00:00').toJSDate(),
      endDate: DateTime.fromISO('2022-07-20T10:00:00').toJSDate(),
      session: session1,
    });
    this.server.create('offering', {
      startDate: DateTime.fromISO('2022-07-20T09:00:00').toJSDate(),
      endDate: DateTime.fromISO('2022-07-20T09:30:00').toJSDate(),
      session: session2,
    });
    const course = this.server.create('course', {
      sessions: [session1, session2, session3],
      year: 2022,
    });
    await page.visit({ courseId: course.id });
    assert.strictEqual(currentURL(), '/data/courses/1/vocabularies');
    assert.strictEqual(page.root.courseTitle.text, 'course 0 2022');
    assert.strictEqual(page.root.courseTitle.link, '/courses/1');
    assert.strictEqual(page.root.breadcrumb.crumbs.length, 3);
    assert.strictEqual(page.root.breadcrumb.crumbs[0].text, 'course 0');
    assert.strictEqual(page.root.breadcrumb.crumbs[0].link, '/courses/1');
    assert.strictEqual(page.root.breadcrumb.crumbs[1].text, 'Visualizations');
    assert.strictEqual(page.root.breadcrumb.crumbs[1].link, '/data/courses/1');
    assert.strictEqual(page.root.breadcrumb.crumbs[2].text, 'Vocabularies');
    // wait for charts to load
    await waitFor('.loaded');
    await waitFor('svg .chart');
    assert.strictEqual(page.root.vocabulariesChart.chart.slices.length, 2);
    assert.strictEqual(page.root.vocabulariesChart.chart.slices[0].text, 'Vocabulary 1');
    assert.strictEqual(page.root.vocabulariesChart.chart.slices[1].text, 'Vocabulary 2');
  });
});
