import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'ilios-common/page-objects/components/big-add-cancel-buttons';
import BigAddCancelButtons from 'ilios-common/components/big-add-cancel-buttons';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | big-add-cancel-buttons', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><BigAddCancelButtons @add={{(noop)}} @cancel={{(noop)}} /></template>);

    assert.ok(component.addButton, 'add button exists');
    assert.strictEqual(component.addButton.cssClasses, 'bigadd', 'css classes correct');
    assert.strictEqual(component.addButton.ariaLabel, 'Save', 'aria-label correct');
    assert.ok(component.cancelButton, 'cancel button exists');
    assert.strictEqual(component.cancelButton.cssClasses, 'bigcancel', 'css classes correct');
    assert.strictEqual(component.cancelButton.ariaLabel, 'Cancel', 'aria-label correct');
  });
});
