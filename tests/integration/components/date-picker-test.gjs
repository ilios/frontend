import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'ilios-common/page-objects/components/date-picker';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import DatePicker from 'ilios-common/components/date-picker';

module('Integration | Component | date-picker', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    const date = new Date(2020, 4, 6);
    this.set('date', date);
    await render(<template><DatePicker @value={{this.date}} /></template>);
    assert.strictEqual(component.value, '5/6/2020');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('onChange callback is invoked', async function (assert) {
    const date = new Date(2020, 4, 6);
    const newDate = new Date(2021, 1, 1);
    this.set('date', date);
    this.set('change', (changedDate) => {
      assert.step('change called');
      assert.strictEqual(newDate.getTime(), changedDate.getTime());
    });
    await render(
      <template><DatePicker @value={{this.date}} @onChange={{this.change}} /></template>,
    );
    component.set(newDate);
    assert.verifySteps(['change called']);
  });
});
