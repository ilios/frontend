import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { a11yAudit } from 'ember-a11y-testing/test-support';

module('Integration | Component | toggle buttons', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    assert.expect(8);

    const firstRadio = 'input:nth-of-type(1)';
    const secondRadio = 'input:nth-of-type(2)';

    this.set('nothing', parseInt);
    await render(hbs`<ToggleButtons
      @action={{(noop)}}
      @firstOptionSelected={{true}}
      @firstLabel="First"
      @firstIcon="user"
      @secondLabel="Second"
      @secondIcon="expand"
    />`);
    await a11yAudit(this.element);
    assert.dom('[data-test-first]').hasText('First', 'first label has correct text');
    assert.dom(firstRadio).isChecked('first radio is checked');
    assert.dom('[data-test-first][data-test-selected]').exists();
    assert
      .dom('[data-test-first]')
      .hasAttribute('for', find(firstRadio).id, 'first label is linked to radio correctly');

    assert.dom('[data-test-second]').hasText('Second', 'second label has correct text');
    assert.dom(secondRadio).isNotChecked('second radio is not checked');
    assert.dom('[data-test-second][data-test-selected]').doesNotExist();
    assert
      .dom('[data-test-second]')
      .hasAttribute('for', find(secondRadio).id, 'second label is linked to radio correctly');
  });

  test('clicking radio fires toggle action', async function (assert) {
    assert.expect(2);

    const first = 'input:nth-of-type(1)';
    const second = 'input:nth-of-type(2)';

    this.set('firstOptionSelected', true);
    let called = 0;
    this.set('toggle', (newValue) => {
      const hasBeenCalled = Boolean(called);
      assert.strictEqual(newValue, hasBeenCalled);
      this.set('firstOptionSelected', newValue);
      called++;
    });
    await render(hbs`<ToggleButtons
      @toggle={{this.toggle}}
      @firstOptionSelected={{this.firstOptionSelected}}
      @firstLabel="Left"
      @secondLabel="Right"
    />`);

    await click(second);
    await click(first);
  });

  test('clicking label fires toggle action', async function (assert) {
    assert.expect(2);

    this.set('firstOptionSelected', true);
    let called = 0;
    this.set('toggle', (newValue) => {
      const hasBeenCalled = Boolean(called);
      assert.strictEqual(newValue, hasBeenCalled);
      this.set('firstOptionSelected', newValue);
      called++;
    });
    await render(hbs`<ToggleButtons
      @toggle={{this.toggle}}
      @firstOptionSelected={{this.firstOptionSelected}}
      @firstLabel="Left"
      @secondLabel="Right"
    />`);

    await click('[data-test-second]');
    await click('[data-test-first]');
  });

  test('clicking selected radio does not fire toggle action', async function (assert) {
    assert.expect(1);

    const first = 'input:nth-of-type(1)';

    this.set('firstOptionSelected', true);
    this.set('toggle', () => {
      assert.ok(false, 'this should not be fired');
    });
    await render(hbs`<ToggleButtons
      @toggle={{this.toggle}}
      @firstOptionSelected={{this.firstOptionSelected}}
      @firstLabel="Left"
      @secondLabel="Right"
    />`);

    await click(first);
    assert.true(this.firstOptionSelected);
  });
});
