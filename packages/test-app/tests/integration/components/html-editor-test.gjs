import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'ilios-common/page-objects/components/html-editor';
import HtmlEditor from 'ilios-common/components/html-editor';

module('Integration | Component | html editor', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><HtmlEditor /></template>);

    assert.ok(component.toolbar, 'toolbar exists');
    assert.ok(component.toolbar.bold, 'toolbar->bold exists');
    assert.ok(component.toolbar.italic, 'toolbar->italic exists');
    assert.ok(component.toolbar.subscript, 'toolbar->subscript exists');
    assert.ok(component.toolbar.superscript, 'toolbar->superscript exists');
    assert.ok(component.toolbar.listOrdered, 'toolbar->ordered list exists');
    assert.ok(component.toolbar.listUnordered, 'toolbar->unordered list exists');
    assert.ok(component.toolbar.link, 'toolbar->link exists');
    assert.ok(component.toolbar.undo, 'toolbar->undo exists');
    assert.ok(component.toolbar.redo, 'toolbar->redo exists');
    assert.ok(component.editor, 'editor area exists');
  });

  test('it toggles popup when link button is clicked', async function (assert) {
    await render(<template><HtmlEditor /></template>);

    assert.notOk(component.popup.activated, 'popup is not visible');
    await component.toolbar.link.click();
    assert.ok(component.popup.activated, 'popup is visible');
    assert.ok(component.popup.form.url, 'url input exists');
    assert.ok(component.popup.form.text, 'text input exists');
    assert.ok(component.popup.form.linkNewTarget, 'link new target checkbox exists');
    await component.toolbar.link.click();
    assert.notOk(component.popup.activated, 'popup is not visible');
  });

  test('undo/redo', async function (assert) {
    const newText = 'Hello universe!';
    this.set('content', '');
    this.set('updateContent', (value) => {
      this.content = value;
    });
    await render(
      <template><HtmlEditor @content={{this.content}} @update={{this.updateContent}} /></template>,
    );

    assert.strictEqual(component.editor.content, '', 'editor has no text currently');
    assert.ok(component.toolbar.undo.disabled, 'undo is disabled');
    assert.ok(component.toolbar.redo.disabled, 'redo is disabled');

    await component.editor.edit(newText);
    assert.strictEqual(component.editor.content, newText, 'editor has correct text inserted');
    assert.ok(component.toolbar.redo.disabled, 'redo is still disabled');
    assert.notOk(component.toolbar.undo.disabled, 'undo is not disabled anymore');

    await component.toolbar.undo.click();
    assert.strictEqual(
      component.editor.content,
      '',
      'editor text is back to no text after undoing',
    );
    assert.ok(component.toolbar.undo.disabled, 'undo is disabled now');
    assert.notOk(component.toolbar.redo.disabled, 'redo is not disabled after using undo');

    await component.toolbar.redo.click();
    assert.strictEqual(component.editor.content, newText, 'editor has text back after redo');
    assert.notOk(component.toolbar.undo.disabled, 'undo is not disabled after redo');
    assert.ok(component.toolbar.redo.disabled, 'redo is disabled after using it');
  });
});
