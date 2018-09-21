import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import component from 'ilios/tests/pages/components/locale-chooser';
import a11yAudit from 'ember-a11y-testing/test-support/audit';

module('Integration | Component | locale-chooser', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders and is accessible', async function(assert) {
    await render(hbs`{{locale-chooser}}`);

    await a11yAudit(this.element);
    assert.equal(component.text, 'English (en)');
    
    await component.toggle.click();
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('click opens menu', async function(assert) {
    await render(hbs`{{locale-chooser}}`);

    assert.equal(component.locales.length, 0);
    await component.toggle.click();
    assert.equal(component.locales.length, 3);

  });

  test('down opens menu', async function(assert) {
    await render(hbs`{{locale-chooser}}`);

    assert.equal(component.locales.length, 0);
    await component.toggle.down();
    assert.equal(component.locales.length, 3);
  });

  test('escape closes menu', async function(assert) {
    await render(hbs`{{locale-chooser}}`);

    await component.toggle.down();
    assert.equal(component.locales.length, 3);
    await component.toggle.esc();
    assert.equal(component.locales.length, 0);
  });

  test('click closes menu', async function(assert) {
    await render(hbs`{{locale-chooser}}`);

    await component.toggle.down();
    assert.equal(component.locales.length, 3);
    await component.toggle.click();
    assert.equal(component.locales.length, 0);
  });

  test('change locale closes menu', async function(assert) {
    await render(hbs`{{locale-chooser}}`);

    await component.toggle.click();
    await component.locales.objectAt(1).click();
    assert.equal(component.locales.length, 0);
    assert.equal(component.text, 'Español (es)');
  });
});
