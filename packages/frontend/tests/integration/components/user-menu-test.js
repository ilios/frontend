import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import component from 'frontend/tests/pages/components/user-menu';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { setupAuthentication } from 'ilios-common';
import { setupMirage } from 'frontend/tests/test-support/mirage';

module('Integration | Component | user-menu', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    await setupAuthentication();
  });

  test('it renders and is accessible', async function (assert) {
    await render(hbs`<UserMenu />`);

    await a11yAudit(this.element);
    assert.strictEqual(component.text, '0 guy M. Mc0son');

    await component.toggle.click();
    await a11yAudit(this.element);

    assert.ok(true, 'no a11y errors found!');
  });

  test('click opens menu', async function (assert) {
    await render(hbs`<UserMenu />`);

    assert.strictEqual(component.links.length, 0);
    await component.toggle.click();
    assert.strictEqual(component.links.length, 2);
  });

  test('down opens menu', async function (assert) {
    await render(hbs`<UserMenu />`);

    assert.strictEqual(component.links.length, 0);
    await component.toggle.down();
    assert.strictEqual(component.links.length, 2);
  });

  test('escape closes menu', async function (assert) {
    await render(hbs`<UserMenu />`);

    await component.toggle.down();
    assert.strictEqual(component.links.length, 2);
    await component.toggle.esc();
    assert.strictEqual(component.links.length, 0);
  });

  test('click closes menu', async function (assert) {
    await render(hbs`<UserMenu />`);

    await component.toggle.down();
    assert.strictEqual(component.links.length, 2);
    await component.toggle.click();
    assert.strictEqual(component.links.length, 0);
  });
});
