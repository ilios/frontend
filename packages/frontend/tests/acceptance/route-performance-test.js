import { currentRouteName, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'frontend/tests/helpers';
import page from 'ilios-common/page-objects/dashboard-week';

module('Acceptance | performance', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    this.set('durationQuick', 1000);
    this.set('durationModerate', 2000);

    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
  });

  test('/dashboard/week', async function (assert) {
    let start = performance.now();

    await page.visit({ show: 'week' });

    let end = performance.now();
    let duration = end - start;

    assert.strictEqual(currentRouteName(), 'dashboard.week');
    assert.ok(duration < this.durationQuick, `Render time was ${duration}ms`);
  });

  test('/courses', async function (assert) {
    let start = performance.now();

    await visit('/courses');

    let end = performance.now();
    let duration = end - start;

    assert.strictEqual(currentRouteName(), 'courses');
    assert.ok(duration < this.durationModerate, `Render time was ${duration}ms`);
  });

  test('/learnergroups', async function (assert) {
    let start = performance.now();

    await visit('/learnergroups');

    let end = performance.now();
    let duration = end - start;

    assert.strictEqual(currentRouteName(), 'learner-groups');
    assert.ok(duration < this.durationQuick, `Render time was ${duration}ms`);
  });

  test('/instructorgroups', async function (assert) {
    let start = performance.now();

    await visit('/instructorgroups');

    let end = performance.now();
    let duration = end - start;

    assert.strictEqual(currentRouteName(), 'instructor-groups');
    assert.ok(duration < this.durationQuick, `Render time was ${duration}ms`);
  });

  test('/schools', async function (assert) {
    let start = performance.now();

    await visit('/schools');

    let end = performance.now();
    let duration = end - start;

    assert.strictEqual(currentRouteName(), 'schools');
    assert.ok(duration < this.durationQuick, `Render time was ${duration}ms`);
  });

  test('/programs', async function (assert) {
    let start = performance.now();

    await visit('/programs');

    let end = performance.now();
    let duration = end - start;

    assert.strictEqual(currentRouteName(), 'programs');
    assert.ok(duration < this.durationQuick, `Render time was ${duration}ms`);
  });

  test('/reports', async function (assert) {
    let start = performance.now();

    await visit('/reports');

    let end = performance.now();
    let duration = end - start;

    assert.strictEqual(currentRouteName(), 'reports');
    assert.ok(duration < this.durationQuick, `Render time was ${duration}ms`);
  });

  test('/admin', async function (assert) {
    let start = performance.now();

    await visit('/admin');

    let end = performance.now();
    let duration = end - start;

    assert.strictEqual(currentRouteName(), 'admin');
    assert.ok(duration < this.durationQuick, `Render time was ${duration}ms`);
  });

  test('/curricum-inventory-reports', async function (assert) {
    let start = performance.now();

    await visit('/curricum-inventory-reports');

    let end = performance.now();
    let duration = end - start;

    assert.ok(duration < this.durationQuick, `Render time was ${duration}ms`);
  });
});
