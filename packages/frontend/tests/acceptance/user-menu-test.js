import { module, test } from 'qunit';
import { setupApplicationTest } from 'frontend/tests/helpers';
import { setupAuthentication } from 'ilios-common';
import dashboardPage from 'frontend/tests/pages/dashboard';
import myprofilePage from 'frontend/tests/pages/my-profile';

module('Acceptance | user menu', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    await setupAuthentication({}, true);
  });

  test('my-profile link is active on my-profile page', async function (assert) {
    await myprofilePage.visit();
    await myprofilePage.iliosHeader.userMenu.toggle.down();

    assert.strictEqual(
      myprofilePage.iliosHeader.userMenu.links.length,
      2,
      'user menu has correct number of links',
    );
    assert.strictEqual(
      myprofilePage.iliosHeader.userMenu.links[0].text,
      'My Profile',
      'first user menu link title is correct',
    );
    assert.ok(
      myprofilePage.iliosHeader.userMenu.links[0].link.isActive,
      'first user menu link is active',
    );
  });

  test('my-profile link is not active on dashboard page', async function (assert) {
    await dashboardPage.visit();
    await dashboardPage.iliosHeader.userMenu.toggle.down();
    assert.strictEqual(dashboardPage.iliosHeader.userMenu.links.length, 2);
    assert.strictEqual(dashboardPage.iliosHeader.userMenu.links[0].text, 'My Profile');
    assert.notOk(dashboardPage.iliosHeader.userMenu.links[0].link.isActive);
  });
});
