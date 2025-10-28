import { module, test } from 'qunit';
import { currentURL, waitFor } from '@ember/test-helpers';
import { setupApplicationTest } from 'frontend/tests/helpers';
import page from 'ilios-common/page-objects/course-visualizations-instructors';
import { setupAuthentication } from 'ilios-common';
import { DateTime } from 'luxon';
import percySnapshot from '@percy/ember';

module('Acceptance | course visualizations - instructors', function (hooks) {
  setupApplicationTest(hooks);
  hooks.beforeEach(async function () {
    this.user = await setupAuthentication({}, true);
    const instructor1 = this.server.create('user');
    const instructor2 = this.server.create('user');
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
    const sessionType1 = this.server.create('session-type');
    const sessionType2 = this.server.create('session-type');
    const session1 = this.server.create('session', {
      sessionType: sessionType1,
      terms: [term1],
    });
    const session2 = this.server.create('session', {
      sessionType: sessionType2,
      terms: [term2, term3],
    });
    const session3 = this.server.create('session');
    const instructorGroup1 = this.server.create('instructor-group', {
      users: [instructor1],
    });
    const instructorGroup2 = this.server.create('instructor-group', {
      users: [instructor2],
    });
    this.server.create('offering', {
      instructorGroups: [instructorGroup1],
      startDate: DateTime.fromISO('2022-07-20T09:00:00').toJSDate(),
      endDate: DateTime.fromISO('2022-07-20T10:00:00').toJSDate(),
      session: session1,
    });
    this.server.create('offering', {
      instructors: [instructor1],
      startDate: DateTime.fromISO('2022-07-20T09:00:00').toJSDate(),
      endDate: DateTime.fromISO('2022-07-20T09:15:00').toJSDate(),
      session: session2,
    });
    this.server.create('offering', {
      instructorGroups: [instructorGroup2],
      startDate: DateTime.fromISO('2022-07-20T09:00:00').toJSDate(),
      endDate: DateTime.fromISO('2022-07-20T10:30:00').toJSDate(),
      session: session1,
    });
    this.course = this.server.create('course', {
      sessions: [session1, session2, session3],
      year: 2022,
    });
  });

  test('it renders', async function (assert) {
    await page.visit({ courseId: this.course.id });
    assert.strictEqual(currentURL(), '/data/courses/1/instructors');
    assert.strictEqual(page.root.title, 'course 0 2022');
    assert.strictEqual(page.root.breadcrumb.crumbs.length, 3);
    assert.strictEqual(page.root.breadcrumb.crumbs[0].text, 'course 0');
    assert.strictEqual(page.root.breadcrumb.crumbs[0].link, '/courses/1');
    assert.strictEqual(page.root.breadcrumb.crumbs[1].text, 'Visualizations');
    assert.strictEqual(page.root.breadcrumb.crumbs[1].link, '/data/courses/1');
    assert.strictEqual(page.root.breadcrumb.crumbs[2].text, 'Instructors');
    // wait for charts to load
    await waitFor('.loaded');
    await waitFor('svg .bars');
    await percySnapshot(assert);
    assert.strictEqual(page.root.instructorsChart.chart.bars.length, 2);
    assert.strictEqual(
      page.root.instructorsChart.chart.bars[0].description,
      '1 guy M. Mc1son - 75 Minutes',
    );
    assert.strictEqual(
      page.root.instructorsChart.chart.bars[1].description,
      '2 guy M. Mc2son - 90 Minutes',
    );
    assert.strictEqual(page.root.instructorsChart.chart.labels.length, 2);
    assert.strictEqual(page.root.instructorsChart.chart.labels[0].text, '1 guy M. Mc1son\u200b');
    assert.strictEqual(page.root.instructorsChart.chart.labels[1].text, '2 guy M. Mc2son\u200b');
    assert.strictEqual(page.root.instructorsChart.dataTable.rows.length, 2);
  });

  test('clicking chart transitions user to instructor visualization', async function (assert) {
    await page.visit({ courseId: this.course.id });
    // wait for charts to load
    await waitFor('.loaded');
    await waitFor('svg .bars');
    assert.strictEqual(page.root.instructorsChart.chart.labels[0].text, '1 guy M. Mc1son\u200b');
    await page.root.instructorsChart.chart.bars[0].click();
    assert.strictEqual(currentURL(), '/data/courses/1/instructors/2');
  });
});
