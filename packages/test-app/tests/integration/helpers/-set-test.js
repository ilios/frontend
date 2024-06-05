import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | set', function (hooks) {
  setupRenderingTest(hooks);

  test('it works when transformed', async function (assert) {
    this.set('content', 'English');
    await render(hbs`
      <span data-test-greeting>{{this.greeting}}</span>

      <button type="button" {{on "click" (set this.greeting "Hello!")}}>
        {{this.content}}
      </button>

`);

    assert.dom('[data-test-greeting]').hasText('');

    await click('button');

    assert.dom('[data-test-greeting]').hasText('Hello!');
  });

  test('it works when called directly', async function (assert) {
    this.set('content', 'English');
    await render(hbs`
      <span data-test-greeting>{{this.greeting}}</span>

      <button type="button" {{on "click" (-set this "greeting" "Hello!")}}>
        {{this.content}}
      </button>

`);

    assert.dom('[data-test-greeting]').hasText('');

    await click('button');

    assert.dom('[data-test-greeting]').hasText('Hello!');
  });
});
