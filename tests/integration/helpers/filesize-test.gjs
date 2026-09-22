import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import filesize from 'frontend/helpers/filesize';

module('helper:filesize', function (hooks) {
  setupRenderingTest(hooks);

  test('it bytes', async function (assert) {
    this.set('inputValue', '42');

    await render(<template>{{filesize this.inputValue}}</template>);

    assert.dom(this.element).hasText('42b');
  });

  test('it kilobytes', async function (assert) {
    this.set('inputValue', '4200');

    await render(<template>{{filesize this.inputValue}}</template>);

    assert.dom(this.element).hasText('4kb');
  });

  test('it megabytes', async function (assert) {
    this.set('inputValue', '4200000');

    await render(<template>{{filesize this.inputValue}}</template>);

    assert.dom(this.element).hasText('4mb');
  });
});
