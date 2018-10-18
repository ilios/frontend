import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | remove-html-tags', function(hooks) {
  setupRenderingTest(hooks);

  // Replace this with your real tests.
  test('it renders', async function(assert) {
    this.set('inputValue', '<p>Tags should</p><p> not show up</p>');

    await render(hbs`{{remove-html-tags inputValue}}`);

    assert.equal(this.element.textContent.trim(), 'Tags should not show up');
  });
});

