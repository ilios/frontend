import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { component } from 'ilios-common/page-objects/components/toggle-yesno';
import ToggleYesno from 'ilios-common/components/toggle-yesno';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | toggle yesno', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('value', true);
    await render(<template><ToggleYesno @yes={{this.value}} @action={{(noop)}} /></template>);
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
    await render(<template><ToggleYesno @yes={{this.value}} @toggle={{this.toggle}} /></template>);
    assert.strictEqual(component.checked, 'true');
    await component.click();
    assert.strictEqual(component.checked, 'false');
    await component.click();
    assert.strictEqual(component.checked, 'true');
    await component.handle.click();
    assert.strictEqual(component.checked, 'false');
    await component.handle.click();
    assert.strictEqual(component.checked, 'true');
  });
});
