import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { htmlSafe } from '@ember/template';
import capitalize from 'ilios-common/helpers/capitalize';

module('Integration | Helper | {{capitalize}}', function (hooks) {
  setupRenderingTest(hooks);

  test('It capitalizes a single string', async function (assert) {
    await render(<template>{{capitalize "hi"}}</template>);

    let expected = 'Hi';

    assert.dom().hasText(expected, 'capitalizes a single string');
  });

  test('It leaves the capitalization unchanged with correctly capitalized string', async function (assert) {
    await render(<template>{{capitalize "Harry"}}</template>);

    let expected = 'Harry';

    assert.dom().hasText(expected, 'leaves capitalization when string is already capitalized');
  });

  test('It correctly capitalizes an uncapitalized sentence', async function (assert) {
    await render(
      <template>
        {{capitalize "age is foolish and forgetful when it underestimates youth"}}
      </template>,
    );

    let expected = 'Age is foolish and forgetful when it underestimates youth';

    assert.dom().hasText(expected, 'correctly capitalizes an uncapitalized sentence');
  });

  test('It correctly handles empty string input', async function (assert) {
    await render(<template>{{capitalize ""}}</template>);

    let expected = '';

    assert.dom().hasText(expected, 'renders empty string if input is empty string');
  });

  test('It correctly handles undefined input', async function (assert) {
    await render(<template>{{capitalize undefined}}</template>);

    let expected = '';

    assert.dom().hasText(expected, 'renders empty string if undefined input');
  });

  test('It handles a SafeString', async function (assert) {
    this.set('greeting', htmlSafe('hi'));

    await render(<template>{{capitalize this.greeting}}</template>);

    let expected = 'Hi';

    assert.dom().hasText(expected, 'correctly capitalizes a SafeString');
  });
});
