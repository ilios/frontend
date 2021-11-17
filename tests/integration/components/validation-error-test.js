import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | validation-error', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders with no errors', async function (assert) {
    await render(hbs`<ValidationError @errors={{(array)}} />`);

    assert.dom(this.element).hasText('');
  });

  test('it renders with errors', async function (assert) {
    await render(hbs`<ValidationError @errors={{array "test 1" "test 2"}} />`);

    assert.dom(this.element).hasText('test 1 test 2');
  });

  test('it responds to changes', async function (assert) {
    this.set('errors', ['one']);
    await render(hbs`<ValidationError @errors={{this.errors}} />`);

    assert.dom(this.element).hasText('one');

    this.set('errors', ['two']);
    assert.dom(this.element).hasText('two');

    this.set('errors', []);
    assert.dom(this.element).hasText('');
  });
});
