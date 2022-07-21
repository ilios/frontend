import { module, test } from 'qunit';
import { currentURL, waitFor } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import page from 'ilios-common/page-objects/course-visualizations-instructor';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupAuthentication } from 'ilios-common';
import { DateTime } from 'luxon';

module('Acceptance | course visualizations - instructor', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.user = await setupAuthentication();
  });

  test('it renders', async function (assert) {
    const instructor = this.server.create('user');
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
    const sessionType1 = this.server.create('sessionType');
    const sessionType2 = this.server.create('sessionType');
    const session1 = this.server.create('session', {
      sessionType: sessionType1,
      terms: [term1],
    });
    const session2 = this.server.create('session', {
      sessionType: sessionType2,
      terms: [term2, term3],
    });
    const session3 = this.server.create('session');
    this.server.create('ilmSession', {
      session: session3,
      hours: 2,
      instructors: [instructor],
    });
    const instructorGroup1 = this.server.create('instructorGroup', {
      users: [instructor],
    });
    this.server.create('offering', {
      instructorGroups: [instructorGroup1],
      startDate: DateTime.fromISO('2022-07-20T09:00:00').toJSDate(),
      endDate: DateTime.fromISO('2022-07-20T10:00:00').toJSDate(),
      session: session1,
    });
    this.server.create('offering', {
      instructors: [instructor],
      startDate: DateTime.fromISO('2022-07-20T09:00:00').toJSDate(),
      endDate: DateTime.fromISO('2022-07-20T09:30:00').toJSDate(),
      session: session2,
    });
    const course = this.server.create('course', {
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
    await waitFor('.loaded');
    await waitFor('svg .bars');
    await waitFor('svg .chart');
    assert.strictEqual(page.root.termsChart.chart.bars.length, 3);
    assert.strictEqual(page.root.termsChart.chart.labels.length, 3);
    assert.strictEqual(page.root.termsChart.chart.labels[0].text, 'Vocabulary 1 > term 0 66.7%');
    assert.strictEqual(page.root.termsChart.chart.labels[1].text, 'Vocabulary 1 > term 1 33.3%');
    assert.strictEqual(page.root.termsChart.chart.labels[2].text, 'Vocabulary 2 > term 2 33.3%');
    assert.strictEqual(page.root.sessionTypesChart.chart.slices.length, 2);
    assert.strictEqual(page.root.sessionTypesChart.chart.slices[0].text, 'session type 0 66.7%');
    assert.strictEqual(page.root.sessionTypesChart.chart.slices[1].text, 'session type 1 33.3%');
  });
});
