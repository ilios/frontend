import { module, test } from 'qunit';
import { currentURL, waitFor } from '@ember/test-helpers';
import { setupApplicationTest, takeScreenshot } from 'frontend/tests/helpers';
import page from 'ilios-common/page-objects/course-visualizations-instructor';
import { setupAuthentication } from 'ilios-common';

module('Acceptance | course visualizations - instructor', function (hooks) {
  setupApplicationTest(hooks);
  hooks.beforeEach(async function () {
    this.user = await setupAuthentication({}, true);
  });

  test('it renders', async function (assert) {
    const instructor = await this.server.create('user');
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
    const sessionType1 = await this.server.create('session-type');
    const sessionType2 = await this.server.create('session-type');
    const session1 = await this.server.create('session', {
      sessionType: sessionType1,
      terms: [term1],
    });
    const session2 = await this.server.create('session', {
      sessionType: sessionType2,
      terms: [term2, term3],
    });
    const session3 = await this.server.create('session');
    await this.server.create('ilm-session', {
      session: session3,
      hours: 2,
      instructors: [instructor],
    });
    const instructorGroup1 = await this.server.create('instructor-group', {
      users: [instructor],
    });
    await this.server.create('offering', {
      instructorGroups: [instructorGroup1],
      startDate: '2022-07-20T09:00:00',
      endDate: '2022-07-20T10:00:00',
      session: session1,
    });
    await this.server.create('offering', {
      instructors: [instructor],
      startDate: '2022-07-20T09:00:00',
      endDate: '2022-07-20T09:30:00',
      session: session2,
    });
    const course = await this.server.create('course', {
      sessions: [session1, session2, session3],
      year: 2022,
    });
    await page.visit({ courseId: course.id, userId: instructor.id });
    assert.strictEqual(currentURL(), '/data/courses/1/instructors/2');
    assert.strictEqual(page.root.title, 'course 0 2022');
    assert.strictEqual(page.root.instructorName, '1 guy M. Mc1son');
    assert.strictEqual(page.root.totalOfferingsTime, 'Total Instructional Time 90 Minutes');
    assert.strictEqual(page.root.totalIlmTime, 'Total ILM Time 120 Minutes');
    assert.strictEqual(page.root.breadcrumb.crumbs.length, 4);
    assert.strictEqual(page.root.breadcrumb.crumbs[0].text, 'course 0');
    assert.strictEqual(page.root.breadcrumb.crumbs[0].link, '/courses/1');
    assert.strictEqual(page.root.breadcrumb.crumbs[1].text, 'Visualizations');
    assert.strictEqual(page.root.breadcrumb.crumbs[1].link, '/data/courses/1');
    assert.strictEqual(page.root.breadcrumb.crumbs[2].text, 'Instructors');
    assert.strictEqual(page.root.breadcrumb.crumbs[2].link, '/data/courses/1/instructors');
    assert.strictEqual(page.root.breadcrumb.crumbs[3].text, '1 guy M. Mc1son');
    // wait for charts to load
    await waitFor('.loaded', { count: 2 });
    await waitFor('svg .bars');
    await waitFor('svg .slice');
    await takeScreenshot(assert);
    assert.strictEqual(page.root.termsChart.chart.bars.length, 3);
    assert.strictEqual(page.root.termsChart.chart.labels.length, 3);
    assert.strictEqual(page.root.termsChart.chart.labels[0].text, 'Vocabulary 1 - term 0\u200b');
    assert.strictEqual(page.root.termsChart.chart.labels[1].text, 'Vocabulary 1 - term 1\u200b');
    assert.strictEqual(page.root.termsChart.chart.labels[2].text, 'Vocabulary 2 - term 2\u200b');
    assert.strictEqual(page.root.sessionTypesChart.chart.slices.length, 2);
    assert.strictEqual(page.root.sessionTypesChart.chart.labels.length, 2);
    assert.strictEqual(page.root.sessionTypesChart.chart.descriptions.length, 2);
    assert.ok(page.root.sessionTypesChart.chart.labels[0].text.startsWith('session type 1'));
    assert.ok(page.root.sessionTypesChart.chart.labels[1].text.startsWith('session type 0'));

    assert.strictEqual(
      page.root.sessionTypesChart.chart.descriptions[0].text,
      'session type 1 - 30 Minutes',
    );
    assert.strictEqual(
      page.root.sessionTypesChart.chart.descriptions[1].text,
      'session type 0 - 60 Minutes',
    );
    assert.strictEqual(page.root.sessionTypesChart.dataTable.rows.length, 2);
  });
});
