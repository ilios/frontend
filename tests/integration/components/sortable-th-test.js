import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | sortable th', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {

    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });" + EOL + EOL +

    await render(hbs`<SortableTh />`);

    assert.dom(this.element).hasText('');

    // Template block usage:" + EOL +
    await render(hbs`<SortableTh>
      template block text
    </SortableTh>`);

    assert.dom(this.element).hasText('template block text');
  });
});
