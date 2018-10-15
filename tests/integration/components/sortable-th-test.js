import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | sortable th', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });" + EOL + EOL +

    await render(hbs`{{sortable-th}}`);

    assert.equal(this.element.textContent.trim(), '');

    // Template block usage:" + EOL +
    await render(hbs`
      {{#sortable-th}}
        template block text
      {{/sortable-th}}
    `);

    assert.equal(this.element.textContent.trim(), 'template block text');
  });
});
