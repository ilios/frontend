import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupIntl } from 'ember-intl/test-support';
import { component } from 'frontend/tests/pages/components/editable-textarea';
import EditableTextarea from 'frontend/components/editable-textarea';
import noop from 'frontend/helpers/noop';

module('Integration | Component | editable textarea', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders text value', async function (assert) {
    await render(<template><EditableTextarea @value="hello" /></template>);
    assert.strictEqual(component.value, 'hello');
  });

  test('it renders html value', async function (assert) {
    await render(
      <template>
        <EditableTextarea @value="<p>hello</p>" />
      </template>,
    );
    assert.strictEqual(component.value, '<p>hello</p>');
  });

  test('it renders clickPrompt', async function (assert) {
    await render(<template><EditableTextarea @clickPrompt="click me!" /></template>);
    assert.strictEqual(component.value, 'click me!');
  });

  test('it always renders an html editor when editing', async function (assert) {
    await render(<template><EditableTextarea /></template>);
    await component.editable.edit();
    assert.ok(component.editor.hasHtmlEditor);
  });

  test('it renders save/cancel actions when editing', async function (assert) {
    await render(<template><EditableTextarea /></template>);
    await component.editable.edit();
    assert.ok(component.editor.hasActions);
  });

  test('it calls save when the save button is clicked', async function (assert) {
    this.set('save', () => {
      assert.step('save called');
    });
    await render(
      <template>
        <EditableTextarea @value="<p>test</p>" @save={{this.save}} @close={{(noop)}} />
      </template>,
    );
    await component.editable.edit();
    await component.save();
    assert.verifySteps(['save called']);
  });

  test('it calls close when the cancel button is clicked', async function (assert) {
    this.set('close', () => {
      assert.step('close called');
    });
    await render(
      <template>
        <EditableTextarea @value="<p>test</p>" @save={{(noop)}} @close={{this.close}} />
      </template>,
    );
    await component.editable.edit();
    await component.cancel();
    assert.verifySteps(['close called']);
  });

  test('it renders :default block content (e.g. validation messages) when editing', async function (assert) {
    const text = 'extra content';

    await render(
      <template>
        <EditableTextarea @value="<p>test</p>">
          <:default>
            <span data-test-extra>{{text}}</span>
          </:default>
        </EditableTextarea>
      </template>,
    );
    await component.editable.edit();
    assert.ok(document.querySelector('[data-test-extra]'));
  });

  test('it renders :value block content in read mode', async function (assert) {
    const text = 'display text';

    await render(
      <template>
        <EditableTextarea @value="<p>test</p>">
          <:value>
            <span data-test-display>{{text}}</span>
          </:value>
        </EditableTextarea>
      </template>,
    );
    assert.ok(document.querySelector('[data-test-display]'));
  });

  test('it renders :postValue block content in read mode', async function (assert) {
    const text = 'post value';

    await render(
      <template>
        <EditableTextarea @value="<p>test</p>">
          <:postValue>
            <span data-test-post>{{text}}</span>
          </:postValue>
        </EditableTextarea>
      </template>,
    );
    assert.ok(document.querySelector('[data-test-post]'));
  });
});
