import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'ilios-common/page-objects/components/big-save-cancel-buttons';
import BigSaveCancelButtons from 'ilios-common/components/big-save-cancel-buttons';
import noop from 'ilios-common/helpers/noop';
import { on } from '@ember/modifier';

module('Integration | Component | big-save-cancel-buttons', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders without block', async function (assert) {
    await render(<template><BigSaveCancelButtons @save={{(noop)}} @cancel={{(noop)}} /></template>);

    assert.ok(component.saveButton, 'save button exists');
    assert.strictEqual(component.saveButton.cssClasses, 'bigsave', 'css classes correct');
    assert.strictEqual(component.saveButton.ariaLabel, 'Save', 'aria-label correct');
    assert.strictEqual(
      component.saveButton.icon.cssClasses,
      'svg-inline--fa fa-check fa-fw',
      'save button icon css classes correct',
    );
    assert.ok(component.cancelButton, 'cancel button exists');
    assert.strictEqual(component.cancelButton.cssClasses, 'bigcancel', 'css classes correct');
    assert.strictEqual(component.cancelButton.ariaLabel, 'Cancel', 'aria-label correct');
    assert.strictEqual(
      component.cancelButton.icon.cssClasses,
      'svg-inline--fa fa-arrow-rotate-left fa-fw',
      'cancel button icon css classes correct',
    );
  });

  test('it renders with block', async function (assert) {
    this.set('saveLabel', 'Add');
    this.set('saveButtonValue', 'Add');
    this.set('cancelLabel', 'Undo');
    this.set('cancelButtonValue', 'Undo');

    await render(
      <template>
        <BigSaveCancelButtons
          @save={{(noop)}}
          @cancel={{(noop)}}
          @disableSave={{(noop)}}
          @disableCancel={{(noop)}}
          as |save cancel disableSave disableCancel|
        >
          <button
            aria-label={{this.saveLabel}}
            type="button"
            class="bigsave"
            disabled={{disableSave}}
            {{on "click" save}}
            data-test-save
          >
            {{this.saveButtonValue}}
          </button>
          <button
            aria-label={{this.cancelLabel}}
            type="button"
            class="bigcancel"
            disabled={{disableCancel}}
            {{on "click" cancel}}
            data-test-cancel
          >
            {{this.cancelButtonValue}}
          </button>
        </BigSaveCancelButtons>
      </template>,
    );

    assert.ok(component.saveButton, 'save button exists');
    assert.strictEqual(component.saveButton.cssClasses, 'bigsave', 'css classes correct');
    assert.strictEqual(component.saveButton.ariaLabel, 'Add', 'aria-label correct');
    assert.ok(component.cancelButton, 'cancel button exists');
    assert.strictEqual(component.cancelButton.cssClasses, 'bigcancel', 'css classes correct');
    assert.strictEqual(component.cancelButton.ariaLabel, 'Undo', 'aria-label correct');
  });

  test('save handler', async function (assert) {
    this.save = function () {
      assert.step('save called');
    };

    await render(
      <template><BigSaveCancelButtons @save={{this.save}} @cancel={{(noop)}} /></template>,
    );

    await component.saveButton.click();
    assert.verifySteps(['save called']);
  });

  test('cancel handler', async function (assert) {
    this.cancel = function () {
      assert.step('cancel called');
    };

    await render(
      <template><BigSaveCancelButtons @save={{(noop)}} @cancel={{this.cancel}} /></template>,
    );

    await component.cancelButton.click();
    assert.verifySteps(['cancel called']);
  });
});
