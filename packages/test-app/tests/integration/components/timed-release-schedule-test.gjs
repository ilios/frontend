import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { DateTime } from 'luxon';
import TimedReleaseSchedule from 'ilios-common/components/timed-release-schedule';

const localeFormatOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
};
module('Integration | Component | timed release schedule', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.intl = this.owner.lookup('service:intl');
  });

  test('it renders with no start and end date', async function (assert) {
    await render(<template><TimedReleaseSchedule /></template>);

    assert.dom(this.element).hasText('Available immediately when published');
  });

  test('it renders nothing with no start and end date and showNoSchedule set to false', async function (assert) {
    await render(<template><TimedReleaseSchedule @showNoSchedule={{false}} /></template>);

    assert.dom('[data-test-timed-release-schedule]').doesNotExist();
  });

  test('it renders with both start and end date', async function (assert) {
    const startDate = DateTime.fromObject({ hour: 8 }).minus({ minutes: 10 });
    const endDate = DateTime.fromObject({ hour: 8 }).minus({ days: 1 });
    this.set('startDate', startDate.toJSDate());
    this.set('endDate', endDate.toJSDate());
    await render(
      <template>
        <TimedReleaseSchedule @startDate={{this.startDate}} @endDate={{this.endDate}} />
      </template>,
    );
    const expectedStartDate = this.intl.formatDate(startDate.toJSDate(), localeFormatOptions);
    const expectedEndDate = this.intl.formatDate(endDate.toJSDate(), localeFormatOptions);

    assert.dom(this.element).hasText(`(Available: ${expectedStartDate} until ${expectedEndDate})`);
  });

  test('it renders with only start date in the future', async function (assert) {
    const tomorrow = DateTime.fromObject({ hour: 8 }).plus({ days: 1 });
    this.set('tomorrow', tomorrow.toJSDate());
    await render(<template><TimedReleaseSchedule @startDate={{this.tomorrow}} /></template>);
    const expectedDate = this.intl.formatDate(tomorrow.toJSDate(), localeFormatOptions);

    assert.dom(this.element).hasText(`(Available: ${expectedDate})`);
  });

  test('it renders empty with only start date in the past', async function (assert) {
    const yesterday = DateTime.fromObject({ hour: 8 }).minus({ days: 1 });
    this.set('yesterday', yesterday.toJSDate());
    await render(<template><TimedReleaseSchedule @startDate={{this.yesterday}} /></template>);
    assert.dom(this.element).hasNoText();
  });

  test('it renders nothing with only start date in the past and showNoSchedule set to false', async function (assert) {
    const yesterday = DateTime.fromObject({ hour: 8 }).minus({ days: 1 });
    this.set('yesterday', yesterday.toJSDate());
    await render(
      <template>
        <TimedReleaseSchedule @startDate={{this.yesterday}} @showNoSchedule={{false}} />
      </template>,
    );
    assert.dom('[data-test-timed-release-schedule]').doesNotExist();
  });

  test('it renders with only end date in the future', async function (assert) {
    const tomorrow = DateTime.fromObject({ hour: 8 }).plus({ days: 1 });
    this.set('tomorrow', tomorrow.toJSDate());
    await render(<template><TimedReleaseSchedule @endDate={{this.tomorrow}} /></template>);
    const expectedDate = this.intl.formatDate(tomorrow.toJSDate(), localeFormatOptions);

    assert.dom(this.element).hasText(`(Available until ${expectedDate})`);
  });

  test('it renders with only end date the past', async function (assert) {
    const yesterday = DateTime.fromObject({ hour: 8 }).minus({ days: 1 });
    this.set('tomorrow', yesterday.toJSDate());
    await render(<template><TimedReleaseSchedule @endDate={{this.tomorrow}} /></template>);
    const expectedDate = this.intl.formatDate(yesterday.toJSDate(), localeFormatOptions);
    assert.dom(this.element).hasText(`(Available until ${expectedDate})`);
  });
});
