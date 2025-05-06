import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'ilios-common/page-objects/components/time-picker';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import TimePicker from 'ilios-common/components/time-picker';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | time-picker', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    const date = new Date(2020, 4, 6, 23, 58);
    this.set('date', date);
  });

  test('it renders and is accessible', async function (assert) {
    await render(<template><TimePicker @date={{this.date}} @action={{(noop)}} /></template>);
    assert.strictEqual(component.hour.value, '11');
    assert.strictEqual(component.hour.options.length, 12);
    assert.strictEqual(component.minute.value, '58');
    assert.strictEqual(component.minute.options.length, 60);
    assert.strictEqual(component.ampm.value, 'PM');
    assert.strictEqual(component.ampm.options.length, 2);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('change hour', async function (assert) {
    assert.expect(4);
    const newHour = '07';
    this.set('action', (value, unit) => {
      assert.strictEqual(unit, 'hour');
      assert.strictEqual(value, 19);
    });
    await render(<template><TimePicker @date={{this.date}} @action={{this.action}} /></template>);
    assert.strictEqual(component.hour.value, '11');
    await component.hour.select(newHour);
    assert.strictEqual(component.hour.value, newHour);
  });

  test('change minute', async function (assert) {
    assert.expect(4);
    const newMinute = '22';
    this.set('action', (value, unit) => {
      assert.strictEqual(unit, 'minute');
      assert.strictEqual(value, 22);
    });
    await render(<template><TimePicker @date={{this.date}} @action={{this.action}} /></template>);
    assert.strictEqual(component.minute.value, '58');
    await component.minute.select(newMinute);
    assert.strictEqual(component.minute.value, newMinute);
  });

  test('change am/pm', async function (assert) {
    assert.expect(6);
    this.set('action', (value, unit) => {
      assert.strictEqual(unit, 'hour');
      assert.strictEqual(value, 11);
    });
    await render(<template><TimePicker @date={{this.date}} @action={{this.action}} /></template>);
    assert.strictEqual(component.hour.value, '11');
    assert.strictEqual(component.ampm.value, 'PM');
    await component.ampm.select('AM');
    assert.strictEqual(component.hour.value, '11');
    assert.strictEqual(component.ampm.value, 'AM');
  });
});
