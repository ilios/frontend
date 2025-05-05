import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import component from 'frontend/tests/pages/components/locale-chooser';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import LocaleChooser from 'frontend/components/locale-chooser';

module('Integration | Component | locale-chooser', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders and is accessible', async function (assert) {
    await render(<template><LocaleChooser /></template>);

    await a11yAudit(this.element);
    assert.strictEqual(component.text, 'English (en)');

    await component.toggle.click();
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('click opens menu', async function (assert) {
    await render(<template><LocaleChooser /></template>);

    assert.strictEqual(component.locales.length, 0);
    await component.toggle.click();
    assert.strictEqual(component.locales.length, 3);
  });

  test('down opens menu', async function (assert) {
    await render(<template><LocaleChooser /></template>);

    assert.strictEqual(component.locales.length, 0);
    await component.toggle.down();
    assert.strictEqual(component.locales.length, 3);
  });

  test('escape closes menu', async function (assert) {
    await render(<template><LocaleChooser /></template>);

    await component.toggle.down();
    assert.strictEqual(component.locales.length, 3);
    await component.toggle.esc();
    assert.strictEqual(component.locales.length, 0);
  });

  test('click closes menu', async function (assert) {
    await render(<template><LocaleChooser /></template>);

    await component.toggle.down();
    assert.strictEqual(component.locales.length, 3);
    await component.toggle.click();
    assert.strictEqual(component.locales.length, 0);
  });

  test('change locale closes menu', async function (assert) {
    await render(<template><LocaleChooser /></template>);

    await component.toggle.click();
    assert.notOk(component.toggle.hasFocus);
    await component.locales[1].click();
    assert.strictEqual(component.locales.length, 0);
    assert.strictEqual(component.text, 'Español (es)');
    assert.ok(component.toggle.hasFocus);
  });

  test('first item in menu receives focus when menu is opened', async function (assert) {
    await render(<template><LocaleChooser /></template>);
    await component.toggle.click();
    assert.strictEqual(component.locales.length, 3);
    assert.ok(component.locales[0].hasFocus);
    assert.notOk(component.locales[1].hasFocus);
    assert.notOk(component.locales[2].hasFocus);
  });

  test('keyboard navigation', async function (assert) {
    await render(<template><LocaleChooser /></template>);
    await component.toggle.click();
    assert.strictEqual(component.locales.length, 3);
    assert.ok(component.locales[0].hasFocus);
    assert.notOk(component.locales[1].hasFocus);
    assert.notOk(component.locales[2].hasFocus);
    // regular down/up navigation
    await component.locales[0].down();
    assert.notOk(component.locales[0].hasFocus);
    assert.ok(component.locales[1].hasFocus);
    assert.notOk(component.locales[2].hasFocus);
    await component.locales[1].down();
    assert.notOk(component.locales[0].hasFocus);
    assert.notOk(component.locales[1].hasFocus);
    assert.ok(component.locales[2].hasFocus);
    await component.locales[2].up();
    assert.notOk(component.locales[0].hasFocus);
    assert.ok(component.locales[1].hasFocus);
    assert.notOk(component.locales[2].hasFocus);
    await component.locales[1].up();
    assert.ok(component.locales[0].hasFocus);
    assert.notOk(component.locales[1].hasFocus);
    assert.notOk(component.locales[2].hasFocus);
    // wrap-around navigation from first to last menu item
    await component.locales[0].up();
    assert.notOk(component.locales[0].hasFocus);
    assert.notOk(component.locales[1].hasFocus);
    assert.ok(component.locales[2].hasFocus);
    // wrap-around navigation from last to first menu item
    await component.locales[2].down();
    assert.ok(component.locales[0].hasFocus);
    assert.notOk(component.locales[1].hasFocus);
    assert.notOk(component.locales[2].hasFocus);
    // close menu on escape, left, right, and tab keys.
    await component.locales[0].esc();
    assert.strictEqual(component.locales.length, 0);
    await component.toggle.click();
    assert.strictEqual(component.locales.length, 3);
    assert.ok(component.locales[0].hasFocus);
    await component.locales[0].left();
    assert.strictEqual(component.locales.length, 0);
    await component.toggle.click();
    assert.strictEqual(component.locales.length, 3);
    assert.ok(component.locales[0].hasFocus);
    await component.locales[0].right();
    assert.strictEqual(component.locales.length, 0);
    await component.toggle.click();
    assert.strictEqual(component.locales.length, 3);
    assert.ok(component.locales[0].hasFocus);
    await component.locales[0].tab();
    assert.strictEqual(component.locales.length, 0);
  });

  test('mouse entering locale-button clears focus', async function (assert) {
    await render(<template><LocaleChooser /></template>);
    await component.toggle.click();
    assert.strictEqual(component.locales.length, 3);
    assert.ok(component.locales[0].hasFocus);
    assert.notOk(component.locales[1].hasFocus);
    assert.notOk(component.locales[2].hasFocus);
    await component.locales[0].mouseEnter();
    assert.notOk(component.locales[0].hasFocus);
    assert.notOk(component.locales[1].hasFocus);
    assert.notOk(component.locales[2].hasFocus);
  });

  test('changing locale', async function (assert) {
    await render(<template><LocaleChooser /></template>);
    assert.strictEqual(component.toggle.text, 'English (en)');
    await component.toggle.click();
    assert.strictEqual(component.locales.length, 3);
    await component.locales[1].click();
    assert.strictEqual(component.locales.length, 0);
    assert.strictEqual(component.toggle.text, 'Español (es)');
    await component.toggle.click();
    await component.locales[2].click();
    assert.strictEqual(component.toggle.text, 'Français (fr)');
    await component.toggle.click();
    await component.locales[0].click();
    assert.strictEqual(component.toggle.text, 'English (en)');
  });
});
