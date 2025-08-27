import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render, triggerKeyEvent } from '@ember/test-helpers';
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

  test('it toggles popup open when link button is clicked', async function (assert) {
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

  test('it toggles popup closed when escape key is pressed', async function (assert) {
    await render(<template><HtmlEditor /></template>);

    assert.notOk(component.popup.activated, 'popup is not visible');
    await component.toolbar.link.click();
    assert.ok(component.popup.activated, 'popup is visible');
    assert.ok(component.popup.form.url, 'url input exists');
    assert.ok(component.popup.form.text, 'text input exists');
    assert.ok(component.popup.form.linkNewTarget, 'link new target checkbox exists');

    await triggerKeyEvent('.ql-popup', 'keydown', 'Escape');
    assert.notOk(component.popup.activated, 'popup is not visible');

    await triggerKeyEvent('.html-editor', 'keydown', 'Escape');
    assert.notOk(
      component.popup.activated,
      'popup is still not visible, because popup was not focused',
    );
  });

  test('it enters link from popup into editor via insert button', async function (assert) {
    this.set('description', '');
    this.set('changeDescription', (value) => {
      this.description = value;
    });
    await render(
      <template>
        <HtmlEditor @content={{this.description}} @update={{this.changeDescription}} />
      </template>,
    );

    assert.notOk(component.popup.activated, 'popup is not visible');
    await component.toolbar.link.click();
    assert.ok(component.popup.activated, 'popup is visible');
    await component.popup.form.url.edit('https://iliosproject.org');
    await component.popup.form.text.edit('Ilios Project');
    await component.popup.form.insert.submit();

    assert.notOk(component.popup.activated, 'popup closed');
    assert.strictEqual(
      component.editor.content.textContent,
      'Ilios Project',
      'editor has correct text',
    );
    assert.strictEqual(
      component.editor.content.htmlContent,
      '<p><a href="https://iliosproject.org/" rel="noopener noreferrer">Ilios Project</a></p>',
      'editor has correct html',
    );
  });

  test('it enters link from popup into editor via Enter key', async function (assert) {
    this.set('description', '');
    this.set('changeDescription', (value) => {
      this.description = value;
    });
    await render(
      <template>
        <HtmlEditor @content={{this.description}} @update={{this.changeDescription}} />
      </template>,
    );

    assert.notOk(component.popup.activated, 'popup is not visible');
    await component.toolbar.link.click();
    assert.ok(component.popup.activated, 'popup is visible');
    await component.popup.form.url.edit('https://iliosproject.org');
    await component.popup.form.text.edit('Ilios Project');
    await triggerKeyEvent('.ql-popup', 'keydown', 'Enter');

    assert.notOk(component.popup.activated, 'popup closed');
    assert.strictEqual(
      component.editor.content.textContent,
      'Ilios Project',
      'editor has correct text',
    );
    assert.strictEqual(
      component.editor.content.htmlContent,
      '<p><a href="https://iliosproject.org/" rel="noopener noreferrer">Ilios Project</a></p>',
      'editor has correct html',
    );
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

    assert.strictEqual(component.editor.content.textContent, '', 'editor has no text currently');
    assert.ok(component.toolbar.undo.disabled, 'undo is disabled');
    assert.ok(component.toolbar.redo.disabled, 'redo is disabled');

    await component.editor.edit(newText);
    assert.strictEqual(
      component.editor.content.textContent,
      newText,
      'editor has correct text inserted',
    );
    assert.ok(component.toolbar.redo.disabled, 'redo is still disabled');
    assert.notOk(component.toolbar.undo.disabled, 'undo is not disabled anymore');

    await component.toolbar.undo.click();
    assert.strictEqual(
      component.editor.content.textContent,
      '',
      'editor text is back to no text after undoing',
    );
    assert.ok(component.toolbar.undo.disabled, 'undo is disabled now');
    assert.notOk(component.toolbar.redo.disabled, 'redo is not disabled after using undo');

    await component.toolbar.redo.click();
    assert.strictEqual(
      component.editor.content.textContent,
      newText,
      'editor has text back after redo',
    );
    assert.notOk(component.toolbar.undo.disabled, 'undo is not disabled after redo');
    assert.ok(component.toolbar.redo.disabled, 'redo is disabled after using it');
  });
});
