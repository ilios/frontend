import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/fractal-page-objects/components/click-choice-buttons';
import { a11yAudit } from 'ember-a11y-testing/test-support';

module('Integration | Component | click choice buttons', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<ClickChoiceButtons
  @toggle={{(noop)}}
  @firstChoicePicked={{true}}
  @buttonContent1='Left Button'
  @buttonContent2='Right Button'
/>`);
    assert
      .dom(component.firstButton.element)
      .hasText('Left Button', 'first button has correct text');
    assert
      .dom(component.secondButton.element)
      .hasText('Right Button', 'second button has correct text');
    assert.dom(component.firstButton.element).hasClass('active');
    assert.dom(component.secondButton.element).hasNoClass('active');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders second choice picked', async function (assert) {
    await render(hbs`<ClickChoiceButtons
  @toggle={{(noop)}}
  @firstChoicePicked={{false}}
  @buttonContent1='Left Button'
  @buttonContent2='Right Button'
/>`);
    assert
      .dom(component.firstButton.element)
      .hasText('Left Button', 'first button has correct text');
    assert
      .dom(component.secondButton.element)
      .hasText('Right Button', 'second button has correct text');
    assert.dom(component.firstButton.element).hasNoClass('active');
    assert.dom(component.secondButton.element).hasClass('active');
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
    await render(hbs`<ClickChoiceButtons
  @toggle={{this.toggle}}
  @firstChoicePicked={{this.firstChoicePicked}}
  @buttonContent1='Left Button'
  @buttonContent2='Right Button'
/>`);
    assert.dom(component.firstButton.element).hasClass('active');
    assert.dom(component.secondButton.element).hasNoClass('active');

    await click(component.secondButton.element);

    assert.dom(component.firstButton.element).hasNoClass('active');
    assert.dom(component.secondButton.element).hasClass('active');

    await click(component.firstButton.element);

    assert.dom(component.firstButton.element).hasClass('active');
    assert.dom(component.secondButton.element).hasNoClass('active');
  });

  test('clicking selected button does not fire toggle action', async function (assert) {
    assert.expect(4);
    this.set('toggle', () => {
      assert.ok(false, 'this should not be fired');
    });
    await render(hbs`<ClickChoiceButtons
  @toggle={{this.toggle}}
  @firstChoicePicked={{true}}
  @buttonContent1='Left Button'
  @buttonContent2='Right Button'
/>`);

    assert.dom(component.firstButton.element).hasClass('active');
    assert.dom(component.secondButton.element).hasNoClass('active');

    await click(component.firstButton.element);

    assert.dom(component.firstButton.element).hasClass('active');
    assert.dom(component.secondButton.element).hasNoClass('active');
  });
});
