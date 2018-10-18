import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | intersection-count', function(hooks) {
  setupRenderingTest(hooks);

  test('same', async function(assert) {
    this.set('first', [42]);
    this.set('second', [42]);

    await render(hbs`{{intersection-count first second}}`);

    assert.equal(this.element.textContent.trim(), '1');
  });

  test('different', async function(assert) {
    this.set('first', [42, 13]);
    this.set('second', [42, 11]);

    await render(hbs`{{intersection-count first second}}`);

    assert.equal(this.element.textContent.trim(), '1');
  });
});
