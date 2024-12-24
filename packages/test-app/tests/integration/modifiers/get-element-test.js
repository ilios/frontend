import { module, test, todo } from 'qunit';
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

  todo('it fails when no callback is given', async function (assert) {
    assert.expect(1);

    // const renderWithoutCallback = async () => {
    //   await render(hbs`<div {{get-element}}></div>`);
    // };
    // assert.throws(
    //   renderWithoutCallback,
    //   /get-element modifier expects a valid callback as the first positional argument/,
    //   'Throws an error when invalid callback is provided',
    // );
  });
});
