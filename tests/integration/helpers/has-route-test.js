import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | has-route', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // doesn't matter what we set here, the result will always be the same - FALSE.
    // @todo figure out how we can reach into `getOwner(this).lookup()` for testing purposes. [ST 2018/10/22]
    this.set('value', 'does-not-matter');
    await render(hbs`{{if (has-route value) 'true' 'false'}}`);
    assert.equal(this.element.textContent.trim(), 'false');
  });
});
