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
    assert.equal(component.checked, 'true');
    this.set('value', false);
    assert.equal(component.checked, 'false');
  });

  test('click', async function (assert) {
    assert.expect(9);
    this.set('value', true);
    this.set('toggle', (val) => {
      const value = this.value;
      assert.equal(!value, val);
      this.set('value', val);
    });
    await render(hbs`<ToggleYesno @yes={{this.value}} @toggle={{this.toggle}} />`);
    assert.equal(component.checked, 'true');
    await component.handle.click();
    assert.equal(component.checked, 'false');
    await component.handle.click();
    assert.equal(component.checked, 'true');
    await component.label.click();
    assert.equal(component.checked, 'false');
    await component.label.click();
    assert.equal(component.checked, 'true');
  });
});
