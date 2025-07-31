import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render, waitFor } from '@ember/test-helpers';
import component from 'frontend/tests/pages/components/user-menu';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { setupAuthentication } from 'ilios-common';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import UserMenu from 'frontend/components/user-menu';

module('Integration | Component | user-menu', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  // My Profile and Logout
  const linkCount = 2;

  test('it renders and is accessible', async function (assert) {
    await setupAuthentication();
    await render(<template><UserMenu /></template>);

    await a11yAudit(this.element);
    assert.strictEqual(component.text, '0 guy M. Mc0son');

    await component.toggle.click();
    await a11yAudit(this.element);

    assert.ok(true, 'no a11y errors found!');
  });

  test('click opens menu', async function (assert) {
    await setupAuthentication();
    await render(<template><UserMenu /></template>);

    assert.strictEqual(component.links.length, 0);
    await component.toggle.click();
    assert.strictEqual(component.links.length, linkCount);
  });

  test('down opens menu', async function (assert) {
    await setupAuthentication();
    await render(<template><UserMenu /></template>);

    assert.strictEqual(component.links.length, 0);
    await component.toggle.down();
    assert.strictEqual(component.links.length, linkCount);
  });

  test('escape closes menu', async function (assert) {
    await setupAuthentication();
    await render(<template><UserMenu /></template>);

    await component.toggle.down();
    assert.strictEqual(component.links.length, linkCount);
    await component.toggle.esc();
    assert.strictEqual(component.links.length, 0);
  });

  test('click closes menu', async function (assert) {
    await setupAuthentication();
    await render(<template><UserMenu /></template>);

    await component.toggle.down();
    assert.strictEqual(component.links.length, linkCount);
    await component.toggle.click();
    assert.strictEqual(component.links.length, 0);
  });

  test('keyboard navigation', async function (assert) {
    await setupAuthentication();
    await render(<template><UserMenu /></template>);
    await component.toggle.click();
    assert.strictEqual(component.links.length, linkCount, `has ${linkCount} links`);

    // slight delay to allow for proper loading of popup menu
    await waitFor('.user-menu .menu');

    assert.ok(component.links[0].link.hasFocus, 'first link has focus');
    assert.notOk(component.links[1].link.hasFocus, 'second link does NOT have focus');

    // regular down/up navigation
    await component.links[0].down();
    assert.notOk(
      component.links[0].link.hasFocus,
      'after moving down from first link, it DOES not have focus',
    );
    assert.ok(component.links[1].link.hasFocus, 'second link has focus');
    await component.links[1].up();
    assert.notOk(
      component.links[1].link.hasFocus,
      'after moving up from second link, it does not have focus',
    );
    assert.ok(component.links[0].link.hasFocus, 'first link has focus');

    // wrap-around navigation from first to last menu item
    await component.links[0].up();
    assert.notOk(component.links[0].link.hasFocus);
    assert.ok(component.links[1].link.hasFocus);
    // wrap-around navigation from last to first menu item
    await component.links[1].down();
    assert.ok(component.links[0].link.hasFocus);
    assert.notOk(component.links[1].link.hasFocus);

    // close menu on escape, left, right, and tab keys.
    await component.links[0].esc();
    assert.strictEqual(component.links.length, 0);
    await component.toggle.click();
    assert.strictEqual(component.links.length, linkCount);
    assert.ok(component.links[0].link.hasFocus);
    await component.links[0].left();
    assert.strictEqual(component.links.length, 0);
    await component.toggle.click();
    assert.strictEqual(component.links.length, linkCount);
    assert.ok(component.links[0].link.hasFocus);
    await component.links[0].right();
    assert.strictEqual(component.links.length, 0);
    await component.toggle.click();
    assert.strictEqual(component.links.length, linkCount);
    assert.ok(component.links[0].link.hasFocus);
    await component.links[0].tab();
    assert.strictEqual(component.links.length, 0);
  });

  test('it renders fallback text when no logged in user', async function (assert) {
    await render(<template><UserMenu /></template>);

    await a11yAudit(this.element);
    assert.strictEqual(component.text, 'User menu');

    assert.ok(true, 'no a11y errors found!');
  });
});
