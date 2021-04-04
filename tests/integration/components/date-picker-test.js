import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { find, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | date-picker', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    const date = new Date(2020, 4, 6);
    this.set('date', date);
    await render(hbs`<DatePicker @value={{this.date}} />`);
    assert.dom('input').hasValue('5/6/2020');
  });

  test('onChange callback is invoked', async function (assert) {
    assert.expect(1);
    const date = new Date(2020, 4, 6);
    const newDate = new Date(2021, 1, 1);
    this.set('date', date);
    this.set('change', (changedDate) => {
      assert.equal(newDate.getTime(), changedDate.getTime());
    });
    await render(hbs`<DatePicker @value={{this.date}} @onChange={{this.change}} />`);
    const element = find('input');
    element._flatpickr.setDate(newDate, true);
  });
});
