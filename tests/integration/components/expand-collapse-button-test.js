import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | expand collapse button', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.actions = {};
    this.send = (actionName, ...args) => this.actions[actionName].apply(this, args);
  });

  test('clicking changes the icon and sends the action', async function(assert) {
    assert.expect(5);
    
    this.set('value', false);
    this.actions.click = () => {
      assert.ok(true, 'button was clicked');
      this.set('value', !this.get('value'));
    };
    await render(hbs`{{expand-collapse-button value=value action='click'}}`);
    assert.ok(this.$('i').hasClass('fa-plus'));
    
    this.$('i').click();
    assert.ok(this.$('i').hasClass('fa-minus'));

    this.$('i').click();
    assert.ok(this.$('i').hasClass('fa-plus'));
    
  });
});