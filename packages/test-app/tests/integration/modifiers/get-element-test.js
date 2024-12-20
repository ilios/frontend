import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Modifier | get-element', function (hooks) {
  setupRenderingTest(hooks);

  test('it passes element to a valid callback', async function (assert) {
    this.rootElement = null;
    this.setRootElement = (element) => {
      this.rootElement = element;
    };
    assert.strictEqual(this.rootElement, null);
    await render(hbs`<div id='root-element' {{get-element this.setRootElement}}></div>`);
    assert.strictEqual(this.rootElement, document.getElementById('root-element'));
  });

  test('it fails when no callback is given', async function (assert) {
    this.rootElement = null;
    assert.strictEqual(this.rootElement, null);
    await render(hbs`<div id='root-element' {{get-element}}></div>`);
    assert.strictEqual(this.rootElement, null);
  });
});
