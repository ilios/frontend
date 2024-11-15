import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | yup-validation-message', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders with no errors', async function (assert) {
    await render(hbs`<YupValidationMessage @messages={{array}} />`);
    assert.dom(this.element).hasText('');
  });

  test('it renders with errors', async function (assert) {
    const errors = ['test 1', 'test 2'];
    this.set('errors', errors);

    await render(hbs`<YupValidationMessage @messages={{this.errors}} />`);

    assert.dom(this.element).hasText(errors.join(' '));
  });
});
