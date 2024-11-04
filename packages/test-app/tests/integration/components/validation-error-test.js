import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | validation-error', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders with no errors', async function (assert) {
    assert.expect(2);

    const propertyName = 'foo';

    this.set('validatable', {
      async getErrorsFor(prop) {
        assert.strictEqual(prop, propertyName);
        return [];
      },
    });
    this.set('propertyName', propertyName);

    await render(
      hbs`<ValidationError @validatable={{this.validatable}} @property={{this.propertyName}} />`,
    );

    assert.dom(this.element).hasText('');
  });

  test('it renders with errors', async function (assert) {
    assert.expect(2);

    const propertyName = 'foo';
    const errors = ['test 1', 'test 2'];

    this.set('validatable', {
      async getErrorsFor(prop) {
        assert.strictEqual(prop, propertyName);
        return errors;
      },
    });
    this.set('propertyName', propertyName);

    await render(
      hbs`<ValidationError @validatable={{this.validatable}} @property={{this.propertyName}} />`,
    );

    assert.dom(this.element).hasText(errors.join(' '));
  });
});
