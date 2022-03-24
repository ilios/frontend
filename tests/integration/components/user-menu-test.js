import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import component from 'ilios/tests/pages/components/user-menu';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { setupAuthentication } from 'ilios-common';
import { setupMirage } from 'ember-cli-mirage/test-support';
import Service from '@ember/service';

module('Integration | Component | user-menu', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    await setupAuthentication();
    class RouterMock extends Service {
      urlFor() {
        return '';
      }
      isActive() {
        return false;
      }
    }
    this.owner.register('service:router', RouterMock);
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
