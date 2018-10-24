import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | toggle yesno', function(hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  test('it renders', async function(assert) {
    assert.expect(2);
    const state = 'input';

    this.set('value', true);
    await render(hbs`{{toggle-yesno yes=value action='clicked'}}`);

    assert.ok(find(state).checked);

    this.set('value', false);
    assert.notOk(find(state).checked);

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
    await render(hbs`{{toggle-yesno yes=value toggle=(action toggle)}}`);
    assert.ok(find(state).checked);
    await click(element);

    assert.notOk(find(state).checked);
    await click(element);
    assert.ok(find(state).checked);
  });
});
