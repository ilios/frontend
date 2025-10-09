import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupIntl } from 'ember-intl/test-support';
import { component } from 'ilios-common/page-objects/components/editable-text';
import EditableText from 'ilios-common/components/editable-text';

module('Integration | Component | editable-text', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders value in read-mode', async function (assert) {
    await render(<template><EditableText @value="woot!" /></template>);
    assert.strictEqual(component.value, 'woot!');
  });

  test('it renders content in edit-mode', async function (assert) {
    this.set('content', 'template block text');
    await render(
      <template>
        <EditableText @value="text" @isEditing={{true}}>
          {{this.content}}
        </EditableText>
      </template>,
    );
    assert.strictEqual(component.value, 'template block text');
  });

  test('it renders a "click to edit" button when it looks empty', async function (assert) {
    this.set(
      'value',
      `
      <p>
        &nbsp;
      </p>
    `,
    );
    await render(<template><EditableText @value={{this.value}} /></template>);
    assert.strictEqual(component.editable.text, 'Click to edit');
  });

  test('it renders a "click to edit" button when it looks empty', async function (assert) {
    assert.expect(2);
    this.set('edit', () => {
      assert.ok(true, 'edit action fired.');
    });
    this.set(
      'value',
      `
      <p>
        &nbsp;
      </p>
    `,
    );
    await render(<template><EditableText @value={{this.value}} @edit={{this.edit}} /></template>);
    assert.strictEqual(component.editable.text, 'Click to edit');
    await component.editable.edit();
  });

  test('edit, save, and close', async function (assert) {
    assert.expect(2);
    this.set('edit', () => {
      assert.ok(true, 'edit action fired.');
    });
    this.set(
      'value',
      `
      <p>
        &nbsp;
      </p>
    `,
    );
    await render(<template><EditableText @value={{this.value}} @edit={{this.edit}} /></template>);
    assert.strictEqual(component.editable.text, 'Click to edit');
    await component.editable.edit();
  });

  test('save and close', async function (assert) {
    assert.expect(2);
    this.set('save', () => {
      assert.ok(true, 'save action fired.');
    });
    this.set('close', () => {
      assert.ok(true, 'close action fired.');
    });
    this.set('value', 'lorem ipsum');
    await render(
      <template>
        <EditableText @isEditing={{true}} @save={{this.save}} @close={{this.close}} />
      </template>,
    );
    await component.save();
  });

  test('close', async function (assert) {
    assert.expect(1);
    this.set('close', () => {
      assert.ok(true, 'close action fired.');
    });
    this.set('value', 'lorem ipsum');
    await render(<template><EditableText @isEditing={{true}} @close={{this.close}} /></template>);
    await component.cancel();
  });
});
