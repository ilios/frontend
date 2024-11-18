import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | yup-validation-message', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders with no errors', async function (assert) {
    await render(hbs`<YupValidationMessage @validationErrors={{(array)}} />`);
    assert.dom(this.element).hasText('');
  });

  test('it renders with empty errors', async function (assert) {
    await render(hbs`<YupValidationMessage @validationErrors={{undefined}} />`);
    assert.dom(this.element).hasText('');
  });

  test('it renders with errors', async function (assert) {
    const errors = [
      {
        messageKey: 'errors.tooShort',
        values: { min: 3 },
      },
      {
        messageKey: 'errors.tooLong',
        values: { max: 17 },
      },
    ];
    this.set('errors', errors);

    await render(hbs`<YupValidationMessage @validationErrors={{this.errors}} />`);

    assert.dom(this.element).includesText('This field is too short (minimum is 3 characters)');
    assert.dom(this.element).includesText('This field is too long (maximum is 17 characters)');
  });

  test('it uses the description when passed', async function (assert) {
    const errors = [
      {
        messageKey: 'errors.tooShort',
        values: { min: 11 },
      },
    ];
    this.set('errors', errors);

    await render(
      hbs`<YupValidationMessage @description='Green Fish' @validationErrors={{this.errors}} />`,
    );

    assert.dom(this.element).includesText('Green Fish is too short (minimum is 11 characters)');
  });
});
