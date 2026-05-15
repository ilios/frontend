import { module, test } from 'qunit';
import { currentURL, waitFor } from '@ember/test-helpers';
import { setupApplicationTest, takeScreenshot } from 'frontend/tests/helpers';
import page from 'ilios-common/page-objects/course-visualizations-vocabulary';
import { setupAuthentication } from 'ilios-common';

module('Acceptance | course visualizations - vocabulary', function (hooks) {
  setupApplicationTest(hooks);
  hooks.beforeEach(async function () {
    this.user = await setupAuthentication({}, true);
    this.vocabulary = await this.server.create('vocabulary');
    const term1 = await this.server.create('term', {
      vocabulary: this.vocabulary,
    });
    const term2 = await this.server.create('term', {
      vocabulary: this.vocabulary,
    });
    const term3 = await this.server.create('term', {
      vocabulary: this.vocabulary,
    });
    const sessionType = await this.server.create('session-type');
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
      terms: [term3],
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
    this.course = await this.server.create('course', {
      sessions: [session1, session2, session3],
      year: 2022,
    });
  });

  test('it renders', async function (assert) {
    await page.visit({ courseId: this.course.id, vocabularyId: this.vocabulary.id });
    assert.strictEqual(currentURL(), '/data/courses/1/vocabularies/1');
    assert.strictEqual(page.root.vocabularyTitle, 'Vocabulary 1');
    assert.strictEqual(page.root.courseTitle.text, 'course 0 2022');
    assert.strictEqual(page.root.courseTitle.link, '/courses/1');
    assert.strictEqual(page.root.breadcrumb.crumbs.length, 4);
    assert.strictEqual(page.root.breadcrumb.crumbs[0].text, 'course 0');
    assert.strictEqual(page.root.breadcrumb.crumbs[0].link, '/courses/1');
    assert.strictEqual(page.root.breadcrumb.crumbs[1].text, 'Visualizations');
    assert.strictEqual(page.root.breadcrumb.crumbs[1].link, '/data/courses/1');
    assert.strictEqual(page.root.breadcrumb.crumbs[2].text, 'Vocabularies');
    assert.strictEqual(page.root.breadcrumb.crumbs[2].link, '/data/courses/1/vocabularies');
    assert.strictEqual(page.root.breadcrumb.crumbs[3].text, 'Vocabulary 1');
    // wait for charts to load
    await waitFor('.loaded');
    await waitFor('svg .bars');
    await takeScreenshot(assert);
    assert.strictEqual(page.root.termsChart.chart.bars.length, 3);
    assert.strictEqual(page.root.termsChart.chart.bars[0].description, 'term 1 - 30 Minutes');
    assert.strictEqual(page.root.termsChart.chart.bars[1].description, 'term 0 - 60 Minutes');
    assert.strictEqual(page.root.termsChart.chart.bars[2].description, 'term 2 - 150 Minutes');
    assert.strictEqual(page.root.termsChart.chart.labels.length, 3);
    assert.strictEqual(page.root.termsChart.chart.labels[0].text, 'term 1\u200b');
    assert.strictEqual(page.root.termsChart.chart.labels[1].text, 'term 0\u200b');
    assert.strictEqual(page.root.termsChart.chart.labels[2].text, 'term 2\u200b');
    assert.strictEqual(page.root.termsChart.dataTable.rows.length, 3);
  });

  test('clicking chart transitions user to term visualization', async function (assert) {
    await page.visit({ courseId: this.course.id, vocabularyId: this.vocabulary.id });
    // wait for charts to load
    await waitFor('.loaded');
    await waitFor('svg .bars');
    assert.strictEqual(page.root.termsChart.chart.labels[0].text, 'term 1\u200b');
    await page.root.termsChart.chart.bars[0].click();
    assert.strictEqual(currentURL(), '/data/courses/1/terms/2');
  });
});
