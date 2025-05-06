import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'ilios-common/page-objects/components/click-choice-buttons';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import ClickChoiceButtons from 'ilios-common/components/click-choice-buttons';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | click choice buttons', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(
      <template>
        <ClickChoiceButtons
          @toggle={{(noop)}}
          @firstChoicePicked={{true}}
          @buttonContent1="Left Button"
          @buttonContent2="Right Button"
        />
      </template>,
    );
    assert.strictEqual(component.firstButton.text, 'Left Button', 'first button has correct text');
    assert.strictEqual(
      component.secondButton.text,
      'Right Button',
      'second button has correct text',
    );
    assert.ok(component.firstButton.isActive);
    assert.notOk(component.secondButton.isActive);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders second choice picked', async function (assert) {
    await render(
      <template>
        <ClickChoiceButtons
          @toggle={{(noop)}}
          @firstChoicePicked={{false}}
          @buttonContent1="Left Button"
          @buttonContent2="Right Button"
        />
      </template>,
    );
    assert.strictEqual(component.firstButton.text, 'Left Button', 'first button has correct text');
    assert.strictEqual(
      component.secondButton.text,
      'Right Button',
      'second button has correct text',
    );
    assert.notOk(component.firstButton.isActive);
    assert.ok(component.secondButton.isActive);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('click fires toggle action', async function (assert) {
    assert.expect(8);
    this.set('firstChoicePicked', true);
    let called = 0;
    this.set('toggle', (newValue) => {
      const hasBeenCalled = Boolean(called);
      assert.strictEqual(newValue, hasBeenCalled);
      this.set('firstChoicePicked', newValue);
      called++;
    });
    await render(
      <template>
        <ClickChoiceButtons
          @toggle={{this.toggle}}
          @firstChoicePicked={{this.firstChoicePicked}}
          @buttonContent1="Left Button"
          @buttonContent2="Right Button"
        />
      </template>,
    );
    assert.ok(component.firstButton.isActive);
    assert.notOk(component.secondButton.isActive);

    await component.secondButton.click();

    assert.notOk(component.firstButton.isActive);
    assert.ok(component.secondButton.isActive);

    await component.firstButton.click();

    assert.ok(component.firstButton.isActive);
    assert.notOk(component.secondButton.isActive);
  });

  test('clicking selected button does not fire toggle action', async function (assert) {
    assert.expect(4);
    this.set('toggle', () => {
      assert.ok(false, 'this should not be fired');
    });
    await render(
      <template>
        <ClickChoiceButtons
          @toggle={{this.toggle}}
          @firstChoicePicked={{true}}
          @buttonContent1="Left Button"
          @buttonContent2="Right Button"
        />
      </template>,
    );

    assert.ok(component.firstButton.isActive);
    assert.notOk(component.secondButton.isActive);

    await component.firstButton.click();

    assert.ok(component.firstButton.isActive);
    assert.notOk(component.secondButton.isActive);
  });
});
