import { module, test } from 'qunit';
import { currentURL, waitFor } from '@ember/test-helpers';
import { setupApplicationTest } from 'frontend/tests/helpers';
import page from 'ilios-common/page-objects/course-visualizations-session-type';
import { setupAuthentication } from 'ilios-common';
import { DateTime } from 'luxon';
import percySnapshot from '@percy/ember';

module('Acceptance | course visualizations - session-type', function (hooks) {
  setupApplicationTest(hooks);
  hooks.beforeEach(async function () {
    this.user = await setupAuthentication({}, true);
  });

  test('it renders', async function (assert) {
    assert.expect(19);
    const sessionType = this.server.create('session-type');
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
    const session3 = this.server.create('session', sessionType);
    this.server.create('ilm-session', {
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
    await page.visit({ courseId: course.id, sessionTypeId: sessionType.id });
    assert.strictEqual(currentURL(), '/data/courses/1/session-types/1');
    assert.strictEqual(page.root.title, 'course 0 2022');
    assert.strictEqual(page.root.breadcrumb.crumbs.length, 4);
    assert.strictEqual(page.root.breadcrumb.crumbs[0].text, 'course 0');
    assert.strictEqual(page.root.breadcrumb.crumbs[0].link, '/courses/1');
    assert.strictEqual(page.root.breadcrumb.crumbs[1].text, 'Visualizations');
    assert.strictEqual(page.root.breadcrumb.crumbs[1].link, '/data/courses/1');
    assert.strictEqual(page.root.breadcrumb.crumbs[2].text, 'Session Types');
    assert.strictEqual(page.root.breadcrumb.crumbs[2].link, '/data/courses/1/session-types');
    assert.strictEqual(page.root.breadcrumb.crumbs[3].text, 'session type 0');
    // wait for charts to load
    await waitFor('.loaded');
    await waitFor('svg .bars');
    await percySnapshot(assert);
    assert.strictEqual(page.root.title, 'course 0 2022');
    assert.strictEqual(page.root.sessionTypeChart.chart.bars.length, 3);
    assert.strictEqual(
      page.root.sessionTypeChart.chart.bars[0].description,
      'Vocabulary 1 - term 1 - 30 Minutes',
    );
    assert.strictEqual(
      page.root.sessionTypeChart.chart.bars[1].description,
      'Vocabulary 1 - term 0 - 60 Minutes',
    );
    assert.strictEqual(
      page.root.sessionTypeChart.chart.bars[2].description,
      'Vocabulary 2 - term 2 - 30 Minutes',
    );
    assert.strictEqual(page.root.sessionTypeChart.chart.labels.length, 3);
    assert.strictEqual(
      page.root.sessionTypeChart.chart.labels[0].text,
      'Vocabulary 1 - term 1\u200b',
    );
    assert.strictEqual(
      page.root.sessionTypeChart.chart.labels[1].text,
      'Vocabulary 1 - term 0\u200b',
    );
    assert.strictEqual(
      page.root.sessionTypeChart.chart.labels[2].text,
      'Vocabulary 2 - term 2\u200b',
    );
  });
});
