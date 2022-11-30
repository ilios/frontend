import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import component from 'ilios/tests/pages/components/locale-chooser';
import a11yAudit from 'ember-a11y-testing/test-support/audit';

module('Integration | Component | locale-chooser', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders and is accessible', async function (assert) {
    await render(hbs`<LocaleChooser />
`);

    await a11yAudit(this.element);
    assert.strictEqual(component.text, 'English (en)');

    await component.toggle.click();
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('click opens menu', async function (assert) {
    await render(hbs`<LocaleChooser />
`);

    assert.strictEqual(component.locales.length, 0);
    await component.toggle.click();
    assert.strictEqual(component.locales.length, 3);
  });

  test('down opens menu', async function (assert) {
    await render(hbs`<LocaleChooser />
`);

    assert.strictEqual(component.locales.length, 0);
    await component.toggle.down();
    assert.strictEqual(component.locales.length, 3);
  });

  test('escape closes menu', async function (assert) {
    await render(hbs`<LocaleChooser />
`);

    await component.toggle.down();
    assert.strictEqual(component.locales.length, 3);
    await component.toggle.esc();
    assert.strictEqual(component.locales.length, 0);
  });

  test('click closes menu', async function (assert) {
    await render(hbs`<LocaleChooser />
`);

    await component.toggle.down();
    assert.strictEqual(component.locales.length, 3);
    await component.toggle.click();
    assert.strictEqual(component.locales.length, 0);
  });

  test('change locale closes menu', async function (assert) {
    await render(hbs`<LocaleChooser />
`);

    await component.toggle.click();
    await component.locales[1].click();
    assert.strictEqual(component.locales.length, 0);
    assert.strictEqual(component.text, 'Español (es)');
  });
});
