import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

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

    assert.dom('[data-test-greeting]').hasText('');

    await click('button');

    assert.dom('[data-test-greeting]').hasText('Hello!');
  });

  test('it works when called directly', async function (assert) {
    await render(hbs`
      <span data-test-greeting>{{this.greeting}}</span>

      <button type="button" {{on "click" (-set this "greeting" "Hello!")}}>
        English
      </button>
    `);

    assert.dom('[data-test-greeting]').hasText('');

    await click('button');

    assert.dom('[data-test-greeting]').hasText('Hello!');
  });
});
