import { getOwner } from '@ember/application';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
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

    assert.ok(this.$(state).prop('checked'));

    this.set('value', false);
    assert.notOk(this.$(state).prop('checked'));

  });

  test('click', async function(assert) {
    assert.expect(5);
    const state = 'input';
    const element = 'span:eq(0)';
    this.set('value', true);
    this.set('toggle', (val) => {
      const value = this.get('value');
      assert.equal(!value, val);
      this.set('value', val);
    });
    await render(hbs`{{toggle-yesno yes=value toggle=(action toggle)}}`);
    assert.ok(this.$(state).prop('checked'));
    this.$(element).click();

    assert.notOk(this.$(state).prop('checked'));
    this.$(element).click();
    assert.ok(this.$(state).prop('checked'));
  });
});