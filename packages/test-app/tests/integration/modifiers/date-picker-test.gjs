import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render, find } from '@ember/test-helpers';
import { DateTime } from 'luxon';
import datePicker from 'ilios-common/modifiers/date-picker';

module('Integration | Modifier | date-picker', function (hooks) {
  setupRenderingTest(hooks);

  test('it works with minimal input', async function (assert) {
    const value = new Date('2014-03-02');
    this.set('value', value);
    await render(
      <template>
        <div data-test-picker-element {{datePicker this.value}}></div>
      </template>,
    );
    const flatpickr = find('[data-test-picker-element]')._flatpickr;
    assert.strictEqual(value.getTime(), flatpickr.selectedDates[0].getTime());
    assert.notOk(flatpickr.config.minDate);
    assert.notOk(flatpickr.config.maxDate);
    assert.dom('option:nth-of-type(1)', flatpickr.monthElements[0]).hasText('January');
  });

  test('it works with minDate, maxDate, and locale as input', async function (assert) {
    const value = new Date('2014-03-02');
    const minDate = new Date('2014-01-12');
    const maxDate = new Date('2014-05-11');
    const locale = 'es';
    this.set('value', value);
    this.set('minDate', minDate);
    this.set('maxDate', maxDate);
    this.set('locale', locale);
    await render(
      <template>
        <div
          data-test-picker-element
          {{datePicker this.value minDate=this.minDate maxDate=this.maxDate locale=this.locale}}
        ></div>
      </template>,
    );
    const flatpickr = find('[data-test-picker-element]')._flatpickr;
    assert.strictEqual(value.getTime(), flatpickr.selectedDates[0].getTime());
    assert.strictEqual(minDate.getTime(), flatpickr.config.minDate.getTime());
    assert.strictEqual(maxDate.getTime(), flatpickr.config.maxDate.getTime());
    assert.dom('option:nth-of-type(1)', flatpickr.monthElements[0]).hasText('Enero');
  });

  test('changing value is responsive', async function (assert) {
    const value = new Date('2014-03-02');
    this.set('value', value);
    await render(
      <template>
        <div data-test-picker-element {{datePicker this.value}}></div>
      </template>,
    );
    const flatpickr = find('[data-test-picker-element]')._flatpickr;
    assert.strictEqual(value.getTime(), flatpickr.selectedDates[0].getTime());
    const newValue = new Date('2024-03-03');
    this.set('value', newValue);
    assert.strictEqual(newValue.getTime(), flatpickr.selectedDates[0].getTime());
  });

  test('changing minDate is responsive', async function (assert) {
    const value = new Date('2014-03-02');
    const minDate = new Date('2014-01-12');
    this.set('value', value);
    this.set('minDate', minDate);
    await render(
      <template>
        <div data-test-picker-element {{datePicker this.value minDate=this.minDate}}></div>
      </template>,
    );
    const flatpickr = find('[data-test-picker-element]')._flatpickr;
    assert.strictEqual(minDate.getTime(), flatpickr.config.minDate.getTime());
    const newMinDate = new Date('2024-03-03');
    this.set('minDate', newMinDate);
    assert.strictEqual(newMinDate.getTime(), flatpickr.config.minDate.getTime());
  });

  test('changing maxDate is responsive', async function (assert) {
    const value = new Date('2014-03-02');
    const maxDate = new Date('2014-01-12');
    this.set('value', value);
    this.set('maxDate', maxDate);
    await render(
      <template>
        <div data-test-picker-element {{datePicker this.value maxDate=this.maxDate}}></div>
      </template>,
    );
    const flatpickr = find('[data-test-picker-element]')._flatpickr;
    assert.strictEqual(maxDate.getTime(), flatpickr.config.maxDate.getTime());
    const newMaxDate = new Date('2024-03-03');
    this.set('maxDate', newMaxDate);
    assert.strictEqual(newMaxDate.getTime(), flatpickr.config.maxDate.getTime());
  });

  test('changing locale is responsive', async function (assert) {
    const value = new Date('2014-03-02');
    const locale = 'es';
    this.set('value', value);
    this.set('locale', locale);
    await render(
      <template>
        <div data-test-picker-element {{datePicker this.value locale=this.locale}}></div>
      </template>,
    );
    const flatpickr = find('[data-test-picker-element]')._flatpickr;
    assert.dom('option:nth-of-type(1)', flatpickr.monthElements[0]).hasText('Enero');
    this.set('locale', 'fr');
    assert.dom('option:nth-of-type(1)', flatpickr.monthElements[0]).hasText('janvier');
  });

  test('onChange callback fires', async function (assert) {
    assert.expect(1);
    const value = new Date('2014-03-02');
    const newValue = new Date('2022-06-23');
    this.set('value', value);
    this.set('onChange', (date) => {
      assert.strictEqual(newValue.getTime(), date.getTime());
    });
    await render(
      <template>
        <div data-test-picker-element {{datePicker this.value onChangeHandler=this.onChange}}></div>
      </template>,
    );
    const flatpickr = find('[data-test-picker-element]')._flatpickr;
    flatpickr.setDate(newValue, true);
  });

  test('weekday restrictions - clicking on invalid date fails', async function (assert) {
    assert.expect(1);
    const value = new Date('2014-03-02'); // a Sunday
    const allowedWeekdays = [DateTime.fromJSDate(value).weekday];
    const newValue = new Date('2022-06-23'); // a Thursday
    this.set('value', value);
    this.set('allowedWeekdays', allowedWeekdays);
    this.set('onChange', (date) => {
      assert.notOk(date);
    });
    await render(
      <template>
        <div
          data-test-picker-element
          {{datePicker
            this.value
            allowedWeekdays=this.allowedWeekdays
            onChangeHandler=this.onChange
          }}
        ></div>
      </template>,
    );
    const flatpickr = find('[data-test-picker-element]')._flatpickr;
    flatpickr.setDate(newValue, true);
  });

  test('weekday restrictions - clicking on valid date succeeds', async function (assert) {
    assert.expect(1);
    const value = new Date('2014-03-02'); // a Sunday
    const allowedWeekdays = [DateTime.fromJSDate(value).weekday];
    const newValue = new Date('2022-06-26'); // another Sunday
    this.set('value', value);
    this.set('allowedWeekdays', allowedWeekdays);
    this.set('onChange', (date) => {
      assert.strictEqual(date.getTime(), newValue.getTime());
    });
    await render(
      <template>
        <div
          data-test-picker-element
          {{datePicker
            this.value
            allowedWeekdays=this.allowedWeekdays
            onChangeHandler=this.onChange
          }}
        ></div>
      </template>,
    );
    const flatpickr = find('[data-test-picker-element]')._flatpickr;
    flatpickr.setDate(newValue, true);
  });
});
