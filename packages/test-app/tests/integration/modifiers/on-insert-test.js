import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Modifier | on-insert', function (hooks) {
  setupRenderingTest(hooks);

  test('it runs valid callback after insertion', async function (assert) {
    assert.expect(1);

    this.set('validCallback', () => {
      assert.ok(true, 'Valid callback was called');
    });

    await render(hbs`<div {{on-insert this.validCallback}}></div>`);
  });

  test('it errs out if invalid callback is provided', async function (assert) {
    assert.expect(1);

    const ogConsoleError = console.error;

    console.error = (msg) => {
      assert.strictEqual(msg, 'Invalid callback provided', 'Logged expected message');
    };

    await render(hbs`<div {{on-insert this.invalidCallback}}></div>`);

    console.error = ogConsoleError;
  });
});
