import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | date-picker', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    const date = new Date(2020, 4, 6);
    this.set('date', date);
    await render(hbs`<DatePicker @value={{this.date}} />`);
    assert.dom('input').hasValue('5/6/2020');
  });
});
