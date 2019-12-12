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
    assert.expect(9);
    const state = 'input';
    const handle = '.switch-handle';
    const label =  '.switch-label';
    this.set('value', true);
    this.set('toggle', (val) => {
      const value = this.get('value');
      assert.equal(!value, val);
      this.set('value', val);
    });
    await render(hbs`<ToggleYesno @yes={{value}} @toggle={{action toggle}} />`);
    assert.dom(state).isChecked();
    await click(handle);
    assert.dom(state).isNotChecked();
    await click(handle);
    assert.dom(state).isChecked();
    await click(label);
    assert.dom(state).isNotChecked();
    await click(label);
    assert.dom(state).isChecked();
  });
});
