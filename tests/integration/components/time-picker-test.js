import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/time-picker';
import { a11yAudit } from 'ember-a11y-testing/test-support';

module('Integration | Component | time-picker', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    const date = new Date(2020, 4, 6, 23, 58);
    this.set('date', date);
  });

  test('it renders and is accessible', async function (assert) {
    await render(hbs`<TimePicker @date={{this.date}} @action={{(noop)}} />`);
    assert.equal(component.hour.value, '11');
    assert.equal(component.hour.options.length, 12);
    assert.equal(component.minute.value, '58');
    assert.equal(component.minute.options.length, 60);
    assert.equal(component.ampm.value, 'pm');
    assert.equal(component.ampm.options.length, 2);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('change hour', async function (assert) {
    assert.expect(4);
    const newHour = '7';
    this.set('action', (value, unit) => {
      assert.equal(unit, 'hour');
      assert.equal(value, '19');
    });
    await render(hbs`<TimePicker @date={{this.date}} @action={{this.action}} />`);
    assert.equal(component.hour.value, '11');
    await component.hour.select(newHour);
    assert.equal(component.hour.value, newHour);
  });

  test('change minute', async function (assert) {
    assert.expect(4);
    const newMinute = '22';
    this.set('action', (value, unit) => {
      assert.equal(unit, 'minute');
      assert.equal(value, '22');
    });
    await render(hbs`<TimePicker @date={{this.date}} @action={{this.action}} />`);
    assert.equal(component.minute.value, '58');
    await component.minute.select(newMinute);
    assert.equal(component.minute.value, newMinute);
  });

  test('change am/pm', async function (assert) {
    assert.expect(6);
    this.set('action', (value, unit) => {
      assert.equal(unit, 'hour');
      assert.equal(value, '11');
    });
    await render(hbs`<TimePicker @date={{this.date}} @action={{this.action}} />`);
    assert.equal(component.hour.value, '11');
    assert.equal(component.ampm.value, 'pm');
    await component.ampm.select('am');
    assert.equal(component.hour.value, '11');
    assert.equal(component.ampm.value, 'am');
  });
});
