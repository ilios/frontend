import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'frontend/tests/helpers';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { setupAuthentication } from 'ilios-common';

module('Acceptance | dashboard accessibility', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    await setupAuthentication({ school });
  });

  test('meets a11y standards in default view', async function (assert) {
    assert.expect(2);
    await visit('/dashboard/week');
    assert.strictEqual(currentURL(), '/dashboard/week');
    await a11yAudit();
    assert.ok(true);
  });

  test('skip link is first in tab order', async function (assert) {
    await visit('/');
    assert.dom('#ember-a11y-refocus-skip-link').exists();
    assert.dom('#ember-a11y-refocus-skip-link').hasProperty('tabIndex', 0);
  });

  test('meets a11y standards in calendar view', async function (assert) {
    assert.expect(2);
    await visit('/dashboard/calendar');
    assert.strictEqual(currentURL(), '/dashboard/calendar');
    await a11yAudit();
    assert.ok(true);
  });
});
