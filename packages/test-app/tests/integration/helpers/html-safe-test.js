import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { htmlSafe } from '@ember/template';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | {{html-safe}}', function (hooks) {
  setupRenderingTest(hooks);

  test('It html-safes the html string', async function (assert) {
    await render(hbs`{{html-safe '<h1>Hello World</h1>'}}`);

    assert.dom('h1').hasText('Hello World', 'html string is correctly rendered');
  });

  test('It safely renders CSS classes from a property', async function (assert) {
    this.set('classes', 'error has-error');
    this.set('text', 'Hello World');
    await render(hbs`<h1 class={{html-safe this.classes}}>{{this.text}}</h1>`);

    assert.dom('h1').hasText('Hello World', 'it renders');
    assert.deepEqual(
      find('h1').getAttribute('class').split(' ').sort(),
      ['error', 'has-error'].sort(),
      'it has the correct CSS classes',
    );
  });

  test('It renders safe-string input', async function (assert) {
    const safeString = htmlSafe('<h1>Hello World</h1>');
    this.set('text', safeString);
    await render(hbs`{{html-safe this.text}}`);
    assert.dom('h1').hasText('Hello World', 'html string is correctly rendered');
  });
});
