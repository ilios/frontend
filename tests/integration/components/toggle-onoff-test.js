import { getOwner } from '@ember/application';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import tHelper from "ember-i18n/helper";

module('Integration | Component | toggle onoff', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.actions = {};
    this.send = (actionName, ...args) => this.actions[actionName].apply(this, args);
  });

  hooks.beforeEach(function() {
    this.owner.lookup('service:i18n').set('locale', 'en');
    this.owner.register('helper:t', tHelper);
  });

  test('toggle on/off works as intended on click events', async function(assert) {
    assert.expect(7);

    this.set('value', true);
    await render(hbs`{{toggle-onoff on=value label='general.location' action='clicked'}}`);

    assert.equal(this.$().text().trim(), 'Location:');
    assert.ok(this.$('input').prop('checked'));

    this.set('value', false);
    assert.ok(!this.$('input').prop('checked'));

    let value = false;
    this.actions.clicked = () => {
      assert.ok(true, 'click was triggered and sends primary action');

      value = !value;
      this.set('value', value);
    };
    this.$('label').click();
    assert.ok(this.$('input').prop('checked'));

    this.$('label').click();
    assert.ok(!this.$('input').prop('checked'));
  });
});