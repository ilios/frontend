import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';

const localeFormatOptions = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
};
module('Integration | Component | timed release schedule', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders with no start and end date', async function (assert) {
    await render(hbs`<TimedReleaseSchedule />`);

    assert.dom(this.element).hasText('Available immediately when published');
  });

  test('it renders nothing with no start and end date and showNoSchedule set to false', async function (assert) {
    await render(hbs`<TimedReleaseSchedule @showNoSchedule={{false}} />`);

    assert.dom(this.element).hasText('');
  });

  test('it renders with both start and end date', async function (assert) {
    const startDate = moment().subtract(10, 'minutes');
    const endDate = moment().add(1, 'day');
    this.set('startDate', startDate.toDate());
    this.set('endDate', endDate.toDate());
    await render(
      hbs`<TimedReleaseSchedule @startDate={{this.startDate}} @endDate={{this.endDate}} />`
    );
    const expectedStartDate = startDate.toDate().toLocaleString([], localeFormatOptions);
    const expectedEndDate = endDate.toDate().toLocaleString([], localeFormatOptions);

    assert
      .dom(this.element)
      .hasText(`(Available: ${expectedStartDate} and available until ${expectedEndDate})`);
  });

  test('it renders with only start date in the future', async function (assert) {
    const tomorrow = moment().add(1, 'day');
    this.set('tomorrow', tomorrow.toDate());
    await render(hbs`<TimedReleaseSchedule @startDate={{this.tomorrow}} />`);
    const expectedDate = tomorrow.toDate().toLocaleString([], localeFormatOptions);

    assert.dom(this.element).hasText(`(Available: ${expectedDate})`);
  });

  test('it renders nothing with only start date in the past', async function (assert) {
    const tomorrow = moment().subtract(1, 'day');
    this.set('tomorrow', tomorrow.toDate());
    await render(hbs`<TimedReleaseSchedule @startDate={{this.tomorrow}} />`);
    assert.dom(this.element).hasNoText();
  });

  test('it renders with only end date in the future', async function (assert) {
    const tomorrow = moment().add(1, 'day');
    this.set('tomorrow', tomorrow.toDate());
    await render(hbs`<TimedReleaseSchedule @endDate={{this.tomorrow}} />`);
    const expectedDate = tomorrow.toDate().toLocaleString([], localeFormatOptions);

    assert.dom(this.element).hasText(`(Available until ${expectedDate})`);
  });

  test('it renders with only end date the past', async function (assert) {
    const tomorrow = moment().subtract(1, 'day');
    this.set('tomorrow', tomorrow.toDate());
    await render(hbs`<TimedReleaseSchedule @endDate={{this.tomorrow}} />`);
    const expectedDate = tomorrow.toDate().toLocaleString([], localeFormatOptions);
    assert.dom(this.element).hasText(`(Available until ${expectedDate})`);
  });
});
