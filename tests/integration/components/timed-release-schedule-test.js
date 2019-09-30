import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';

module('Integration | Component | timed release schedule', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders with no start and end date', async function(assert) {
    await render(hbs`<TimedReleaseSchedule />`);

    assert.dom(this.element).hasText('Available immediately when published');
  });

  test('it renders nothing with no start and end date and showNoSchedule set to false', async function(assert) {
    await render(hbs`<TimedReleaseSchedule @showNoSchedule={{false}} />`);

    assert.dom(this.element).hasText('');
  });

  test('it renders with both start and end date', async function(assert) {
    const startDate = moment().subtract(10, 'minutes');
    const endDate = moment().add(1, 'day');
    this.set('startDate', startDate.toDate());
    this.set('endDate', endDate.toDate());
    await render(hbs`<TimedReleaseSchedule @startDate={{startDate}} @endDate={{endDate}} />`);
    const expectedStartDate = startDate.format('L LT');
    const expectedEndDate = endDate.format('L LT');

    assert.dom(this.element).hasText(`(Available: ${expectedStartDate} and available until ${expectedEndDate})`);
  });

  test('it renders just start date', async function(assert) {
    const tomorrow = moment().add(1, 'day');
    this.set('tomorrow', tomorrow.toDate());
    await render(hbs`<TimedReleaseSchedule @startDate={{tomorrow}} />`);
    const expectedDate = tomorrow.format('L LT');

    assert.dom(this.element).hasText(`(Available: ${expectedDate})`);
  });

  test('it renders just end date', async function(assert) {
    const tomorrow = moment().add(1, 'day');
    this.set('tomorrow', tomorrow.toDate());
    await render(hbs`<TimedReleaseSchedule @endDate={{tomorrow}} />`);
    const expectedDate = tomorrow.format('L LT');

    assert.dom(this.element).hasText(`(Available until ${expectedDate})`);
  });
});
