import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'frontend/tests/pages/components/password-validator';

module('Integration | Component | password-validator', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<PasswordValidator />`);

    assert.ok(component, 'component exists');
    assert.strictEqual(component.label, 'Password:', 'has Password label');
  });

  test('it fails blank password', async function (assert) {
    await render(hbs`<PasswordValidator />`);

    assert.false(component.hasError, 'no error with no input');
    await component.submit();
    assert.true(component.hasError, 'shows blank password error');
  });

  test('it fails short password', async function (assert) {
    await render(hbs`<PasswordValidator />`);

    await component.fillIn('abc');
    await component.submit();
    assert.true(component.hasError);
  });

  test('it passes valid password', async function (assert) {
    await render(hbs`<PasswordValidator />`);

    await component.fillIn('abcde');
    assert.false(component.hasError);
  });

  test('password strength 0 display', async function (assert) {
    await render(hbs`<PasswordValidator />`);

    await component.fillIn('12345');
    assert.strictEqual(component.meter.value, 0);
    assert.strictEqual(component.strength.text, 'Try Harder');
    assert.ok(component.strength.hasZeroClass);
  });

  test('password strength 1 display', async function (assert) {
    await render(hbs`<PasswordValidator />`);

    await component.fillIn('12345ab');
    assert.strictEqual(component.meter.value, 1);
    assert.strictEqual(component.strength.text, 'Bad');
    assert.ok(component.strength.hasOneClass);
  });

  test('password strength 2 display', async function (assert) {
    await render(hbs`<PasswordValidator />`);

    await component.fillIn('12345ab13&');
    assert.strictEqual(component.meter.value, 2);
    assert.strictEqual(component.strength.text, 'Weak');
    assert.ok(component.strength.hasTwoClass);
  });

  test('password strength 3 display', async function (assert) {
    await render(hbs`<PasswordValidator />`);

    await component.fillIn('12345ab13&!!');
    assert.strictEqual(component.meter.value, 3);
    assert.strictEqual(component.strength.text, 'Good');
    assert.ok(component.strength.hasThreeClass);
  });

  test('password strength 4 display', async function (assert) {
    await render(hbs`<PasswordValidator />`);

    await component.fillIn('12345ab13&HHtB');
    assert.strictEqual(component.meter.value, 4);
    assert.strictEqual(component.strength.text, 'Strong');
    assert.ok(component.strength.hasFourClass);
  });
});
