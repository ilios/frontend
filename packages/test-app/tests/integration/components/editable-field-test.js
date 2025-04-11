import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import { component } from 'ilios-common/page-objects/components/editable-field';

module('Integration | Component | editable field', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders value', async function (assert) {
    await render(hbs`<EditableField @value='woot!' />`);
    assert.strictEqual(component.value, 'woot!');
    assert.notOk(component.hasEditIcon);
  });

  test('edit icon is present', async function (assert) {
    await render(hbs`<EditableField @value='woot!' @showIcon={{true}} />`);
    assert.strictEqual(component.value, 'woot!');
    assert.ok(component.hasEditIcon);
  });

  test('it renders clickPrompt', async function (assert) {
    await render(hbs`<EditableField @clickPrompt='click me!' />`);
    assert.strictEqual(component.value, 'click me!');
  });

  test('it renders content', async function (assert) {
    this.set('content', 'template block text');
    await render(hbs`<EditableField @value='text'>
  {{this.content}}
</EditableField>`);
    assert.strictEqual(component.value, 'text');
    await component.editable.edit();
    assert.strictEqual(component.value, 'template block text');
  });

  test('it renders an edit icon when it looks empty', async function (assert) {
    this.set(
      'value',
      `
      <p>
        &nbsp;
      </p>
    `,
    );
    await render(hbs`<EditableField @value={{this.value}} />`);
    assert.strictEqual(component.value, '');
    assert.strictEqual(component.editable.iconCount, 1);
  });

  test('save on enter', async function (assert) {
    assert.expect(1);
    this.set('label', 'Foo');
    this.set('value', 'lorem');
    this.set('save', () => {
      assert.ok(true, 'save action fired.');
    });
    await render(
      hbs`<EditableField @save={{this.save}} @saveOnEnter={{true}} @value={{this.value}}>
  <label>
    <input value={{this.value}} {{on 'input' (pick 'target.value' (set this 'value'))}} />
    {{this.label}}
  </label>
</EditableField>`,
    );
    await component.editable.edit();
    await component.enter();
  });

  test('close on escape', async function (assert) {
    assert.expect(1);
    this.set('label', 'Foo');
    this.set('value', 'lorem');
    this.set('revert', () => {
      assert.ok(true, 'revert action fired.');
    });
    await render(
      hbs`<EditableField @close={{this.revert}} @closeOnEscape={{true}} @value={{this.value}}>
  <label>
    <input value={{this.value}} {{on 'input' (pick 'target.value' (set this 'value'))}} />
    {{this.label}}
  </label>
</EditableField>`,
    );
    await component.editable.edit();
    await component.escape();
  });

  test('focus when editor opens on input', async function (assert) {
    this.set('value', 'lorem');
    this.set('label', 'Foo');
    await render(
      hbs`<EditableField @value={{this.value}}>
  <label><input />{{this.label}}</label>
</EditableField>`,
    );
    await component.editable.edit();
    assert.ok(component.inputHasFocus);
  });

  test('focus when editor opens on textarea', async function (assert) {
    this.set('value', 'lorem');
    this.set('label', 'Foo Bar');
    await render(hbs`<EditableField @value={{this.value}}>
  <label for='textarea'>{{this.label}}</label>
  <textarea id='textarea'></textarea>
</EditableField>`);
    await component.editable.edit();
    assert.ok(component.textareaHasFocus);
  });

  test('expand/collapse overlong html', async function (assert) {
    const text = `
      <p>A long list:</p><ol><li>One</li><li>two</li><li>Five!</li><li>Six</li><li>Seven but with extra text to make long</li><li>a</li><li>b</li><li>c</li><li>d</li><li>e</li><li>f</li><li>g</li><li>h</li><li>iii</li><li>Jjjjjj</li><li>k</li><li>lLLLLLLlll</li><li>mmmmmMMMMMmm</li><li>nnnnnOPE</li><li>ohno</li><li>pppppPowerbook</li></ol>
    `;
    const fadedSelector = '.faded';
    this.set('value', text);
    this.set('fadeTextIsExpanded', false);
    this.set('expandAllFadeText', (isExpanded) => {
      this.set('fadeTextIsExpanded', isExpanded);
    });
    await render(
      hbs`<EditableField
  @value={{this.value}}
  @fadeTextExpanded={{this.fadeTextIsExpanded}}
  @onExpandAllFadeText={{this.expandAllFadeText}}
/>`,
    );

    await waitFor(fadedSelector);

    assert.ok(component.fadeText.enabled);
    assert.ok(component.fadeText.displayText.isFaded);

    await component.fadeText.control.expand.click();

    assert.notOk(component.fadeText.displayText.isFaded);

    await component.fadeText.control.collapse.click();
    await waitFor(fadedSelector);

    assert.ok(component.fadeText.displayText.isFaded);
  });

  test('sends status info', async function (assert) {
    this.set('status', false);
    await render(
      hbs`<EditableField @close={{(noop)}} @value='lorem' @onEditingStatusChange={{set this 'status'}} />`,
    );
    assert.notOk(this.status);
    await component.editable.edit();
    assert.ok(this.status);
    await component.cancel();
    assert.notOk(this.status);
  });

  test('it has title property value only if @showTitle is true', async function (assert) {
    await render(hbs`<EditableField @value='lorem' />`);

    assert.strictEqual(component.editable.title, '');

    this.set('showTitle', true);
    await render(hbs`<EditableField @value='lorem' @showTitle={{this.showTitle}} />`);

    assert.strictEqual(component.editable.title, 'Edit');
  });
});
