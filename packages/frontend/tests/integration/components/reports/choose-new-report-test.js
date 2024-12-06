import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import component from 'frontend/tests/pages/components/reports/choose-new-report';
import a11yAudit from 'ember-a11y-testing/test-support/audit';

module('Integration | Component | reports/choose-new-report', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders and is accessible', async function (assert) {
    await render(hbs`<Reports::ChooseNewReport />`);

    await a11yAudit(this.element);
    assert.strictEqual(component.text, 'Add');

    await component.toggle.click();
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('click opens menu', async function (assert) {
    await render(hbs`<Reports::ChooseNewReport />`);

    assert.strictEqual(component.types.length, 0);
    await component.toggle.click();
    assert.strictEqual(component.types.length, 2);
  });

  test('down opens menu', async function (assert) {
    await render(hbs`<Reports::ChooseNewReport />`);

    assert.strictEqual(component.types.length, 0);
    await component.toggle.down();
    assert.strictEqual(component.types.length, 2);
  });

  test('escape closes menu', async function (assert) {
    await render(hbs`<Reports::ChooseNewReport />`);

    await component.toggle.down();
    assert.strictEqual(component.types.length, 2);
    await component.toggle.esc();
    assert.strictEqual(component.types.length, 0);
  });

  test('click closes menu', async function (assert) {
    await render(hbs`<Reports::ChooseNewReport />`);

    await component.toggle.down();
    assert.strictEqual(component.types.length, 2);
    await component.toggle.click();
    assert.strictEqual(component.types.length, 0);
  });

  test('choose report closes menu', async function (assert) {
    await render(hbs`<Reports::ChooseNewReport @choose={{(noop)}} />`);

    await component.toggle.click();
    assert.notOk(component.toggle.hasFocus);
    await component.types[1].click();
    assert.strictEqual(component.types.length, 0);
    assert.strictEqual(component.text, 'Add');
  });

  test('first item in menu receives focus when menu is opened', async function (assert) {
    await render(hbs`<Reports::ChooseNewReport />`);
    await component.toggle.click();
    assert.strictEqual(component.types.length, 2);
    assert.ok(component.types[0].hasFocus);
    assert.notOk(component.types[1].hasFocus);
  });

  test('keyboard navigation', async function (assert) {
    await render(hbs`<Reports::ChooseNewReport />`);
    await component.toggle.click();
    assert.strictEqual(component.types.length, 2);
    assert.ok(component.types[0].hasFocus);
    assert.notOk(component.types[1].hasFocus);
    // regular down/up navigation
    await component.types[0].down();
    assert.notOk(component.types[0].hasFocus);
    assert.ok(component.types[1].hasFocus);
    await component.types[1].down();
    assert.ok(component.types[0].hasFocus);
    assert.notOk(component.types[1].hasFocus);
    await component.types[1].up();
    assert.ok(component.types[0].hasFocus);
    assert.notOk(component.types[1].hasFocus);
    // wrap-around navigation from first to last menu item
    await component.types[0].up();
    assert.notOk(component.types[0].hasFocus);
    assert.ok(component.types[1].hasFocus);
    // wrap-around navigation from last to first menu item
    await component.types[1].down();
    assert.ok(component.types[0].hasFocus);
    assert.notOk(component.types[1].hasFocus);
    // close menu on escape, left, right, and tab keys.
    await component.types[0].esc();
    assert.strictEqual(component.types.length, 0);
    await component.toggle.click();
    assert.strictEqual(component.types.length, 2);
    assert.ok(component.types[0].hasFocus);
    await component.types[0].left();
    assert.strictEqual(component.types.length, 0);
    await component.toggle.click();
    assert.strictEqual(component.types.length, 2);
    assert.ok(component.types[0].hasFocus);
    await component.types[0].right();
    assert.strictEqual(component.types.length, 0);
    await component.toggle.click();
    assert.strictEqual(component.types.length, 2);
    assert.ok(component.types[0].hasFocus);
    await component.types[0].tab();
    assert.strictEqual(component.types.length, 0);
  });

  test('mouse entering choice button clears focus', async function (assert) {
    await render(hbs`<Reports::ChooseNewReport />`);
    await component.toggle.click();
    assert.strictEqual(component.types.length, 2);
    assert.ok(component.types[0].hasFocus);
    assert.notOk(component.types[1].hasFocus);
    await component.types[0].mouseEnter();
    assert.notOk(component.types[0].hasFocus);
    assert.notOk(component.types[1].hasFocus);
  });

  test('choosing report', async function (assert) {
    assert.expect(5);
    this.set('choose', (type) => {
      assert.strictEqual(type, 'Course');
    });
    await render(hbs`<Reports::ChooseNewReport @choose={{this.choose}} />`);
    assert.strictEqual(component.toggle.text, 'Add');
    await component.toggle.click();
    assert.strictEqual(component.types.length, 2);
    await component.types[1].click();
    assert.strictEqual(component.types.length, 0);
    assert.strictEqual(component.toggle.text, 'Add');
    this.set('choose', (type) => {
      assert.strictEqual(type, 'Subject');
    });
  });
});
