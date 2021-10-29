import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupIntl } from 'ember-intl/test-support';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { component } from 'ilios-common/page-objects/components/toggle-yesno';

module('Integration | Component | toggle yesno', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  test('it renders', async function (assert) {
    this.set('value', true);
    await render(hbs`<ToggleYesno @yes={{this.value}} @action={{(noop)}} />`);
    await a11yAudit(this.element);
    assert.ok(true, 'not a11y violations');
    assert.strictEqual(component.checked, 'true');
    this.set('value', false);
    assert.strictEqual(component.checked, 'false');
  });

  test('click', async function (assert) {
    assert.expect(9);
    this.set('value', true);
    this.set('toggle', (val) => {
      const value = this.value;
      assert.strictEqual(!value, val);
      this.set('value', val);
    });
    await render(hbs`<ToggleYesno @yes={{this.value}} @toggle={{this.toggle}} />`);
    assert.strictEqual(component.checked, 'true');
    await component.handle.click();
    assert.strictEqual(component.checked, 'false');
    await component.handle.click();
    assert.strictEqual(component.checked, 'true');
    await component.label.click();
    assert.strictEqual(component.checked, 'false');
    await component.label.click();
    assert.strictEqual(component.checked, 'true');
  });
});
