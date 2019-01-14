import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | sessions-grid-offering', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    const offering = {};
    this.set('offering', offering);
    await render(hbs`{{sessions-grid-offering offering=offering}}`);

    assert.dom(this.element).hasText('');
  });
});
