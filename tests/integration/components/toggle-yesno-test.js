import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import tHelper from "ember-i18n/helper";

module('Integration | Component | toggle yesno', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.owner.lookup('service:i18n').set('locale', 'en');
    this.owner.register('helper:t', tHelper);
  });

  test('it renders', async function(assert) {
    assert.expect(2);
    const state = 'input';

    this.set('value', true);
    await render(hbs`{{toggle-yesno yes=value action='clicked'}}`);

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
    await render(hbs`{{toggle-yesno yes=value toggle=(action toggle)}}`);
    assert.dom(state).isChecked();
    await click(element);

    assert.dom(state).isNotChecked();
    await click(element);
    assert.dom(state).isChecked();
  });
});
