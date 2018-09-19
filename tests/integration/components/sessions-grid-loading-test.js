import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | sessions-grid-loading', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`{{sessions-grid-loading count=5}}`);

    assert.dom('[data-test-row]').exists({ count: 5 });
  });
});
