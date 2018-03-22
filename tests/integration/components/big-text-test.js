import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | big text', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`{{big-text}}`);
    assert.equal(this.$().text().trim(), '');
  });
});
