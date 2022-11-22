import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render, click, triggerKeyEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | editable field', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders value', async function (assert) {
    await render(hbs`<EditableField @value="woot!" />
`);

    assert.dom(this.element).hasText('woot!');
  });

  test('it renders clickPrompt', async function (assert) {
    await render(hbs`<EditableField @clickPrompt="click me!" />
`);

    assert.dom(this.element).hasText('click me!');
  });

  test('it renders content', async function (assert) {
    this.set('content', 'template block text');
    await render(hbs`
      <EditableField @value="text">
        {{this.content}}
      </EditableField>

`);

    assert.dom(this.element).hasText('text');
    await click('[data-test-edit]');
    assert.dom(this.element).hasText('template block text');
  });

  test('it renders an edit icon when it looks empty', async function (assert) {
    const icon = '.fa-pen-to-square';
    this.set(
      'value',
      `
      <p>
        &nbsp;
      </p>
    `
    );
    await render(hbs`<EditableField @value={{this.value}} />
`);

    assert.dom(this.element).hasText('');
    assert.dom(icon).exists({ count: 1 });
  });

  test('save on enter', async function (assert) {
    assert.expect(1);
    this.set('label', 'Foo');
    this.set('value', 'lorem');
    this.set('save', () => {
      assert.ok(true, 'save action fired.');
    });
    await render(
      hbs`<EditableField
            @save={{this.save}} @saveOnEnter={{true}} @value={{this.value}}
          >
            <label>
              <input value={{this.value}} {{on "input" (pick "target.value" (set this.value))}}>
              {{this.label}}
            </label>
          </EditableField>

`
    );
    await click('[data-test-edit]');
    await triggerKeyEvent('.editinplace input', 'keyup', 13);
  });

  test('close on escape', async function (assert) {
    assert.expect(1);
    this.set('label', 'Foo');
    this.set('value', 'lorem');
    this.set('revert', () => {
      assert.ok(true, 'revert action fired.');
    });
    await render(
      hbs`<EditableField
            @close={{this.revert}}
            @closeOnEscape={{true}}
            @value={{this.value}}
          >
            <label>
              <input value={{this.value}} {{on "input" (pick "target.value" (set this.value))}}>
              {{this.label}}
            </label>
          </EditableField>

`
    );
    await click('[data-test-edit]');
    await triggerKeyEvent('.editinplace input', 'keyup', 27);
  });

  test('focus when editor opens on input', async function (assert) {
    assert.expect(1);
    this.set('value', 'lorem');
    this.set('label', 'Foo');
    await render(
      hbs`<EditableField
            @value={{this.value}}
          >
            <label><input>{{this.label}}</label>
          </EditableField>

`
    );
    await click('[data-test-edit]');
    assert.dom('input', this.element).isFocused();
  });

  test('focus when editor opens on textarea', async function (assert) {
    assert.expect(1);
    this.set('value', 'lorem');
    this.set('label', 'Foo Bar');
    await render(
      hbs`<EditableField
            @value={{this.value}}
          >
            <label for="textarea">{{this.label}}</label>
            <textarea id="textarea"></textarea>
          </EditableField>

`
    );
    await click('[data-test-edit]');

    assert.dom('textarea', this.element).isFocused();
  });

  test('expand/collapse overlong text', async function (assert) {
    const text = 't'.repeat(400);
    const abbreviatedText = 't'.repeat(200);
    this.set('value', text);
    await render(hbs`<EditableField @value={{this.value}} />
`);
    assert.dom(this.element).hasText(abbreviatedText);
    await click('[data-test-expand]');
    assert.dom(this.element).hasText(text);
    await click('[data-test-collapse]');
    assert.dom(this.element).hasText(abbreviatedText);
  });

  test('sends status info', async function (assert) {
    assert.expect(3);
    this.set('status', false);
    await render(
      hbs`<EditableField
            @close={{(noop)}}
            @value="lorem"
            @onEditingStatusChange={{set this.status}}
          >
          </EditableField>

`
    );
    assert.notOk(this.status);
    await click('[data-test-edit]');
    assert.ok(this.status);
    await click('[data-test-cancel]');
    assert.notOk(this.status);
  });
});
