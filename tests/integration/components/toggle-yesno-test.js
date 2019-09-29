import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | toggle yesno', function(hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  test('it renders', async function(assert) {
    assert.expect(2);
    const state = 'input';

    this.set('value', true);
    await render(hbs`<ToggleYesno @yes={{value}} @action="clicked" />`);

    assert.dom(state).isChecked();

    this.set('value', false);
    assert.dom(state).isNotChecked();

  });

  test('click', async function(assert) {
    assert.expect(5);
    const state = 'input';
    const element = 'span:nth-of-type(1)';
    this.set('value', true);
    this.set('toggle', (val) => {
      const value = this.get('value');
      assert.equal(!value, val);
      this.set('value', val);
    });
    await render(hbs`<ToggleYesno @yes={{value}} @toggle={{action toggle}} />`);
    assert.dom(state).isChecked();
    await click(element);

    assert.dom(state).isNotChecked();
    await click(element);
    assert.dom(state).isChecked();
  });
});
