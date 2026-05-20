import { module, test } from 'qunit';
import { currentURL, waitFor } from '@ember/test-helpers';
import { setupApplicationTest, takeScreenshot } from 'frontend/tests/helpers';
import page from 'ilios-common/page-objects/course-visualizations-vocabularies';
import { setupAuthentication } from 'ilios-common';

module('Acceptance | course visualizations - vocabularies', function (hooks) {
  setupApplicationTest(hooks);
  hooks.beforeEach(async function () {
    this.user = await setupAuthentication({}, true);
  });

  test('it renders', async function (assert) {
    const sessionType = await this.server.create('session-type');
    const vocabulary1 = await this.server.create('vocabulary');
    const vocabulary2 = await this.server.create('vocabulary');
    const term1 = await this.server.create('term', {
      vocabulary: vocabulary1,
    });
    const term2 = await this.server.create('term', {
      vocabulary: vocabulary1,
    });
    const term3 = await this.server.create('term', {
      vocabulary: vocabulary2,
    });
    const session1 = await this.server.create('session', {
      sessionType,
      terms: [term1],
    });
    const session2 = await this.server.create('session', {
      sessionType,
      terms: [term2, term3],
    });
    const session3 = await this.server.create('session', {
      sessionType,
    });
    await this.server.create('ilm-session', {
      session: session3,
      hours: 2,
    });
    await this.server.create('offering', {
      startDate: '2022-07-20T09:00:00',
      endDate: '2022-07-20T10:00:00',
      session: session1,
    });
    await this.server.create('offering', {
      startDate: '2022-07-20T09:00:00',
      endDate: '2022-07-20T09:30:00',
      session: session2,
    });
    const course = await this.server.create('course', {
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
    await waitFor('svg .bars');
    await takeScreenshot(assert);
    assert.strictEqual(page.root.vocabulariesChart.chart.bars.length, 2);
    assert.strictEqual(
      page.root.vocabulariesChart.chart.bars[0].description,
      'Vocabulary 2 - 30 Minutes',
    );
    assert.strictEqual(
      page.root.vocabulariesChart.chart.bars[1].description,
      'Vocabulary 1 - 90 Minutes',
    );
    assert.strictEqual(page.root.vocabulariesChart.chart.labels.length, 2);
    assert.strictEqual(page.root.vocabulariesChart.chart.labels[0].text, 'Vocabulary 2\u200b');
    assert.strictEqual(page.root.vocabulariesChart.chart.labels[1].text, 'Vocabulary 1\u200b');
    assert.strictEqual(page.root.vocabulariesChart.dataTable.rows.length, 2);
  });
});
