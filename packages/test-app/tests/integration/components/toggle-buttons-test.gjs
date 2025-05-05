import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { component } from 'ilios-common/page-objects/components/toggle-buttons';
import ToggleButtons from 'ilios-common/components/toggle-buttons';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | toggle buttons', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(
      <template>
        <ToggleButtons
          @toggle={{(noop)}}
          @firstOptionSelected={{true}}
          @firstLabel="First"
          @secondLabel="Second"
        />
      </template>,
    );
    assert.strictEqual(component.firstLabel.text, 'First');
    assert.ok(component.firstButton.isChecked);
    assert.strictEqual(component.secondLabel.text, 'Second');
    assert.notOk(component.secondButton.isChecked);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders with second option selected', async function (assert) {
    await render(
      <template>
        <ToggleButtons
          @toggle={{(noop)}}
          @firstOptionSelected={{false}}
          @firstLabel="First"
          @secondLabel="Second"
        />
      </template>,
    );
    assert.strictEqual(component.firstLabel.text, 'First');
    assert.notOk(component.firstButton.isChecked);
    assert.strictEqual(component.secondLabel.text, 'Second');
    assert.ok(component.secondButton.isChecked);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('toggle action fires when clicking first button', async function (assert) {
    assert.expect(1);
    this.set('toggle', (value) => {
      assert.ok(value);
    });
    await render(
      <template>
        <ToggleButtons
          @toggle={{this.toggle}}
          @firstOptionSelected={{false}}
          @firstLabel="Left"
          @secondLabel="Right"
        />
      </template>,
    );
    await component.firstButton.click();
  });

  test('toggle action fires when clicking second button', async function (assert) {
    assert.expect(1);
    this.set('toggle', (value) => {
      assert.notOk(value);
    });
    await render(
      <template>
        <ToggleButtons
          @toggle={{this.toggle}}
          @firstOptionSelected={{true}}
          @firstLabel="Left"
          @secondLabel="Right"
        />
      </template>,
    );
    await component.secondButton.click();
  });

  test('toggle action fires when clicking first label', async function (assert) {
    assert.expect(1);
    this.set('toggle', (value) => {
      assert.ok(value);
    });
    await render(
      <template>
        <ToggleButtons
          @toggle={{this.toggle}}
          @firstOptionSelected={{false}}
          @firstLabel="Left"
          @secondLabel="Right"
        />
      </template>,
    );
    await component.firstButton.click();
  });

  test('toggle action fires when clicking second label', async function (assert) {
    assert.expect(1);
    this.set('toggle', (value) => {
      assert.notOk(value);
    });
    await render(
      <template>
        <ToggleButtons
          @toggle={{this.toggle}}
          @firstOptionSelected={{true}}
          @firstLabel="Left"
          @secondLabel="Right"
        />
      </template>,
    );
    await component.secondButton.click();
  });

  test('clicking selected first button does not fire toggle action', async function (assert) {
    assert.expect(2);
    this.set('toggle', () => {
      assert.ok(false, 'this should not be fired');
    });
    await render(
      <template>
        <ToggleButtons
          @toggle={{this.toggle}}
          @firstOptionSelected={{true}}
          @firstLabel="Left"
          @secondLabel="Right"
        />
      </template>,
    );

    assert.true(component.firstButton.isChecked);
    await component.firstButton.click();
    assert.true(component.firstButton.isChecked);
  });

  test('clicking selected second button does not fire toggle action', async function (assert) {
    assert.expect(2);
    this.set('toggle', () => {
      assert.ok(false, 'this should not be fired');
    });
    await render(
      <template>
        <ToggleButtons
          @toggle={{this.toggle}}
          @firstOptionSelected={{false}}
          @firstLabel="Left"
          @secondLabel="Right"
        />
      </template>,
    );

    assert.true(component.secondButton.isChecked);
    await component.secondButton.click();
    assert.true(component.secondButton.isChecked);
  });

  test('clicking selected first label does not fire toggle action', async function (assert) {
    assert.expect(2);
    this.set('toggle', () => {
      assert.ok(false, 'this should not be fired');
    });
    await render(
      <template>
        <ToggleButtons
          @toggle={{this.toggle}}
          @firstOptionSelected={{true}}
          @firstLabel="Left"
          @secondLabel="Right"
        />
      </template>,
    );

    assert.true(component.firstButton.isChecked);
    await component.firstLabel.click();
    assert.true(component.firstButton.isChecked);
  });

  test('clicking selected second label does not fire toggle action', async function (assert) {
    assert.expect(2);
    this.set('toggle', () => {
      assert.ok(false, 'this should not be fired');
    });
    await render(
      <template>
        <ToggleButtons
          @toggle={{this.toggle}}
          @firstOptionSelected={{false}}
          @firstLabel="Left"
          @secondLabel="Right"
        />
      </template>,
    );

    assert.true(component.secondButton.isChecked);
    await component.secondLabel.click();
    assert.true(component.secondButton.isChecked);
  });
});
