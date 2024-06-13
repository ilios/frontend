import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | remove-html-tags', function (hooks) {
  setupRenderingTest(hooks);

  // Replace this with your real tests.
  test('it renders', async function (assert) {
    this.set('inputValue', '<p>Tags should</p><p> not show up</p>');

    await render(hbs`{{remove-html-tags this.inputValue}}
`);

    assert.dom(this.element).hasText('Tags should not show up');
  });
});
