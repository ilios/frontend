import { module, test } from 'qunit';
import { currentURL, waitFor } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import page from 'ilios-common/page-objects/course-visualizations-vocabulary';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupAuthentication } from 'ilios-common';
import { DateTime } from 'luxon';

module('Acceptance | course visualizations - vocabulary', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.user = await setupAuthentication();
  });

  test('it renders', async function (assert) {
    const vocabulary = this.server.create('vocabulary');
    const term1 = this.server.create('term', {
      vocabulary,
    });
    const term2 = this.server.create('term', {
      vocabulary,
    });
    const term3 = this.server.create('term', {
      vocabulary,
    });
    const sessionType = this.server.create('sessionType');
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
      terms: [term3],
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
    await page.visit({ courseId: course.id, vocabularyId: vocabulary.id });
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
    assert.strictEqual(page.root.termsChart.chart.bars.length, 3);
    assert.strictEqual(page.root.termsChart.chart.labels.length, 3);
    assert.strictEqual(page.root.termsChart.chart.labels[0].text, 'term 1: 30 Minutes');
    assert.strictEqual(page.root.termsChart.chart.labels[1].text, 'term 0: 60 Minutes');
    assert.strictEqual(page.root.termsChart.chart.labels[2].text, 'term 2: 150 Minutes');
  });
});
