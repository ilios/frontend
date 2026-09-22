import { module, test } from 'qunit';
import { setupAuthentication, freezeDateAt, unfreezeDate } from 'ilios-common';
import { setupApplicationTest } from 'frontend/tests/helpers';
import page from 'ilios-common/page-objects/weeklyevents';
import { DateTime } from 'luxon';

module('Acceptance | Weekly events', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    this.user = await setupAuthentication();
  });

  hooks.afterEach(() => {
    unfreezeDate();
  });

  test('back link is not visible', async function (assert) {
    await page.visit();
    assert.notOk(page.backLink.isPresent);
  });

  test('shows the right weeks in 2025 #6366', async function (assert) {
    const dt = DateTime.fromObject({ year: 2025, month: 1, day: 1 });
    freezeDateAt(dt.toJSDate());
    await page.visit();
    assert.deepEqual(page.weeklyEvents.weeks.length, 52);
    assert.deepEqual(page.weeklyEvents.weeks[0].title, 'December 29 - January 4');
    assert.deepEqual(page.weeklyEvents.weeks[51].title, 'December 21-27');
  });

  test('shows the right weeks in 2026 #6366', async function (assert) {
    const dt = DateTime.fromObject({ year: 2026, month: 7, day: 15 });
    freezeDateAt(dt.toJSDate());
    await page.visit();
    assert.deepEqual(page.weeklyEvents.weeks.length, 53);
    assert.deepEqual(page.weeklyEvents.weeks[0].title, 'December 28 - January 3');
    assert.deepEqual(page.weeklyEvents.weeks[52].title, 'December 27 - January 2');
  });

  test('shows the right weeks in 2027 #6366', async function (assert) {
    const dt = DateTime.fromObject({ year: 2027, month: 7, day: 15 });
    freezeDateAt(dt.toJSDate());
    await page.visit();
    assert.deepEqual(page.weeklyEvents.weeks.length, 52);
    assert.deepEqual(page.weeklyEvents.weeks[0].title, 'January 3-9');
    assert.deepEqual(page.weeklyEvents.weeks[51].title, 'December 26 - January 1');
  });
});
