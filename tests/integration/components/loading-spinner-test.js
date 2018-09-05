import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | loading-spinner', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`{{loading-spinner}}`);

    assert.equal(this.$().text().trim(), '');
    assert.ok(this.$('svg').hasClass('fa-spinner'));
  });
});
