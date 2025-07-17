import { module, test } from 'qunit';
import { array } from '@ember/helper';
import { render } from '@ember/test-helpers';
import { setupRenderingTest } from 'test-app/tests/helpers';
import validationMessages from 'ilios-common/helpers/validation-messages';

module('Integration | Helper | validation-messages', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders with no errors', async function (assert) {
    await render(<template>{{validationMessages undefined}}</template>);
    assert.dom(this.element).hasText('');
  });

  test('it renders with empty errors', async function (assert) {
    this.set('errors', null);
    await render(<template>{{validationMessages (array)}}</template>);
    assert.dom(this.element).hasText('');
  });

  test('it renders with the first error by default', async function (assert) {
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

    await render(<template>{{validationMessages this.errors}}</template>);

    assert.dom(this.element).hasText('This field is too short (minimum is 3 characters)');
  });

  test('it renders with all errors', async function (assert) {
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

    await render(<template>{{validationMessages this.errors showAll=true}}</template>);

    assert
      .dom(this.element)
      .hasText(
        'This field is too short (minimum is 3 characters) This field is too long (maximum is 17 characters)',
      );
  });

  test('it uses the description when passed', async function (assert) {
    const errors = [
      {
        messageKey: 'errors.tooShort',
        values: { min: 11 },
      },
    ];
    this.set('errors', errors);

    await render(<template>{{validationMessages this.errors description="Green Fish"}}</template>);

    assert.dom(this.element).hasText('Green Fish is too short (minimum is 11 characters)');
  });
});
