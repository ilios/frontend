import { module, test } from 'qunit';
import { setupIntl } from 'ember-intl/test-support';
import { setupTest } from 'test-app/tests/helpers';
import validationMessages from 'test-app/utils/validation-messages';

module('Unit | Utility | validation-messages', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks, 'en-us');

  hooks.beforeEach(function () {
    this.intl = this.owner.lookup('service:intl');
  });

  test('it renders with no errors', async function (assert) {
    const messages = validationMessages(this.intl, []);
    assert.strictEqual(messages.length, 0);
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
    const messages = validationMessages(this.intl, errors);
    assert.strictEqual(messages.length, 1);
    assert.strictEqual(messages[0], 'This field is too short (minimum is 3 characters)');
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
    const messages = validationMessages(this.intl, errors, { showAll: true });
    assert.strictEqual(messages.length, 2);
    assert.strictEqual(messages[0], 'This field is too short (minimum is 3 characters)');
    assert.strictEqual(messages[1], 'This field is too long (maximum is 17 characters)');
  });

  test('it uses the description when passed', async function (assert) {
    const errors = [
      {
        messageKey: 'errors.tooShort',
        values: { min: 11 },
      },
    ];
    const messages = validationMessages(this.intl, errors, {
      description: 'Green Fish',
      showAll: true,
    });
    assert.strictEqual(messages.length, 1);
    assert.strictEqual(messages[0], 'Green Fish is too short (minimum is 11 characters)');
  });
});
