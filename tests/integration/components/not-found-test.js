import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | not-found', function(hooks) {
  setupRenderingTest(hooks);

  test('it display not found message', async function(assert) {
    await render(hbs`{{not-found}}`);

    assert.ok(this.element.textContent.includes("Rats! I couldn't find that. Please check your page address, and try again."));
  });
});
