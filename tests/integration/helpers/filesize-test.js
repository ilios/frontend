
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('helper:filesize', function(hooks) {
  setupRenderingTest(hooks);

  test('it bytes', async function(assert) {
    this.set('inputValue', '42');

    await render(hbs`{{filesize inputValue}}`);

    assert.equal(this.element.textContent.trim(), '42b');
  });

  test('it kilobytes', async function(assert) {
    this.set('inputValue', '4200');

    await render(hbs`{{filesize inputValue}}`);

    assert.equal(this.element.textContent.trim(), '4kb');
  });

  test('it megabytes', async function(assert) {
    this.set('inputValue', '4200000');

    await render(hbs`{{filesize inputValue}}`);

    assert.equal(this.element.textContent.trim(), '4mb');
  });
});
