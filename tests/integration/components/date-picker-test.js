import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/date-picker';
import { a11yAudit } from 'ember-a11y-testing/test-support';

module('Integration | Component | date-picker', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders', async function (assert) {
    const date = new Date(2020, 4, 6);
    this.set('date', date);
    await render(hbs`<DatePicker @value={{this.date}} />`);
    assert.strictEqual(component.value, '5/6/2020');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('onChange callback is invoked', async function (assert) {
    assert.expect(1);
    const date = new Date(2020, 4, 6);
    const newDate = new Date(2021, 1, 1);
    this.set('date', date);
    this.set('change', (changedDate) => {
      assert.strictEqual(newDate.getTime(), changedDate.getTime());
    });
    await render(hbs`<DatePicker @value={{this.date}} @onChange={{this.change}} />`);
    component.set(newDate);
  });
});
