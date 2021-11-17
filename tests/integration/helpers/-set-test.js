import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render, find, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | set', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it works when transformed', async function (assert) {
    await render(hbs`
      <span data-test-greeting>{{this.greeting}}</span>

      <button type="button" {{on "click" (set this.greeting "Hello!")}}>
        English
      </button>
    `);

    assert.strictEqual(find('[data-test-greeting]').textContent.trim(), '');

    await click('button');

    assert.strictEqual(find('[data-test-greeting]').textContent.trim(), 'Hello!');
  });

  test('it works when called directly', async function (assert) {
    await render(hbs`
      <span data-test-greeting>{{this.greeting}}</span>

      <button type="button" {{on "click" (-set this "greeting" "Hello!")}}>
        English
      </button>
    `);

    assert.strictEqual(find('[data-test-greeting]').textContent.trim(), '');

    await click('button');

    assert.strictEqual(find('[data-test-greeting]').textContent.trim(), 'Hello!');
  });
});
