import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render, waitFor } from '@ember/test-helpers';
import { setupIntl } from 'ember-intl/test-support';
import { component } from 'ilios-common/page-objects/components/editable-field';
import EditableField from 'ilios-common/components/editable-field';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | editable field', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders value', async function (assert) {
    await render(<template><EditableField @value="woot!" /></template>);
    assert.strictEqual(component.value, 'woot!');
    assert.notOk(component.hasEditIcon);
  });

  test('edit icon is present', async function (assert) {
    await render(<template><EditableField @value="woot!" @showIcon={{true}} /></template>);
    assert.strictEqual(component.value, 'woot!');
    assert.ok(component.hasEditIcon);
  });

  test('it renders clickPrompt', async function (assert) {
    await render(<template><EditableField @clickPrompt="click me!" /></template>);
    assert.strictEqual(component.value, 'click me!');
  });

  test('it renders content', async function (assert) {
    this.set('content', 'template block text');
    await render(
      <template>
        <EditableField @value="text">
          {{this.content}}
        </EditableField>
      </template>,
    );
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
    await render(<template><EditableField @value={{this.value}} /></template>);
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
      <template>
        <EditableField @save={{this.save}} @value={{this.value}} as |keyboard|>
          <label>
            <input
              value={{this.value}}
              {{on "input" (pick "target.value" (set this "value"))}}
              {{keyboard}}
            />
            {{this.label}}
          </label>
        </EditableField>
      </template>,
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
      <template>
        <EditableField @close={{this.revert}} @value={{this.value}} as |keyboard|>
          <label>
            <input
              value={{this.value}}
              {{on "input" (pick "target.value" (set this "value"))}}
              {{keyboard}}
            />
            {{this.label}}
          </label>
        </EditableField>
      </template>,
    );
    await component.editable.edit();
    await component.escape();
  });

  test('focus when editor opens on input', async function (assert) {
    this.set('value', 'lorem');
    this.set('label', 'Foo');
    await render(
      <template>
        <EditableField @value={{this.value}}>
          <label><input />{{this.label}}</label>
        </EditableField>
      </template>,
    );
    await component.editable.edit();
    assert.ok(component.inputHasFocus);
  });

  test('focus when editor opens on textarea', async function (assert) {
    this.set('value', 'lorem');
    this.set('label', 'Foo Bar');
    await render(
      <template>
        <EditableField @value={{this.value}}>
          <label for="textarea">{{this.label}}</label>
          <textarea id="textarea"></textarea>
        </EditableField>
      </template>,
    );
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
      <template>
        <EditableField
          @value={{this.value}}
          @fadeTextExpanded={{this.fadeTextIsExpanded}}
          @onExpandAllFadeText={{this.expandAllFadeText}}
        />
      </template>,
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
      <template>
        <EditableField
          @close={{(noop)}}
          @value="lorem"
          @onEditingStatusChange={{set this "status"}}
        />
      </template>,
    );
    assert.notOk(this.status);
    await component.editable.edit();
    assert.ok(this.status);
    await component.cancel();
    assert.notOk(this.status);
  });

  test('it has title property value only if @showTitle is true', async function (assert) {
    await render(<template><EditableField @value="lorem" /></template>);

    assert.strictEqual(component.editable.title, undefined);

    this.set('showTitle', true);
    await render(
      <template><EditableField @value="lorem" @showTitle={{this.showTitle}} /></template>,
    );

    assert.strictEqual(component.editable.title, 'Edit');
  });

  test('ignores save on enter', async function (assert) {
    assert.expect(0);
    this.set('label', 'Foo');
    this.set('value', 'lorem');
    this.set('save', () => {
      assert.ok(false, 'should never be called');
    });
    await render(
      <template>
        <EditableField @save={{this.save}} @value={{this.value}} as |keyboard|>
          <label>
            <input
              value={{this.value}}
              {{on "input" (pick "target.value" (set this "value"))}}
              {{keyboard saveOnEnter=false}}
            />
            {{this.label}}
          </label>
        </EditableField>
      </template>,
    );
    await component.editable.edit();
    await component.enter();
  });

  test('ignored close on escape', async function (assert) {
    assert.expect(0);
    this.set('label', 'Foo');
    this.set('value', 'lorem');
    this.set('revert', () => {
      assert.ok(false, 'should never be called');
    });
    await render(
      <template>
        <EditableField @close={{this.revert}} @value={{this.value}} as |keyboard|>
          <label>
            <input
              value={{this.value}}
              {{on "input" (pick "target.value" (set this "value"))}}
              {{keyboard closeOnEscape=false}}
            />
            {{this.label}}
          </label>
        </EditableField>
      </template>,
    );
    await component.editable.edit();
    await component.escape();
  });
});
