import { module, test, todo } from 'qunit';
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
    const editor = '.html-editor';
    const popup = '.ql-popup';

    await render(<template><HtmlEditor /></template>);

    assert.notOk(component.popup.activated, 'popup is not visible');
    await component.toolbar.link.click();
    assert.ok(component.popup.activated, 'popup is visible');
    assert.ok(component.popup.form.url, 'url input exists');
    assert.ok(component.popup.form.text, 'text input exists');
    assert.ok(component.popup.form.linkNewTarget, 'link new target checkbox exists');

    await triggerKeyEvent(popup, 'keydown', 'Escape');
    assert.notOk(component.popup.activated, 'popup is not visible');

    await triggerKeyEvent(editor, 'keydown', 'Escape');
    assert.notOk(
      component.popup.activated,
      'popup is still not visible, because popup was not focused',
    );
  });

  test('it enters link from popup into editor via insert button', async function (assert) {
    const link = { href: 'https://iliosproject.org', text: 'Ilios Project' };

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
    await component.popup.form.url.edit(link.href);
    await component.popup.form.text.edit(link.text);
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
    const link = { href: 'https://iliosproject.org', text: 'Ilios Project' };
    const popup = '.ql-popup';

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

    await component.popup.form.url.edit(link.href);
    await component.popup.form.text.edit(link.text);

    await triggerKeyEvent(popup, 'keydown', 'Enter');

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

  test('it fails to add link if missing link text or URL', async function (assert) {
    await render(<template><HtmlEditor /></template>);

    assert.notOk(component.popup.activated, 'popup is not visible');
    await component.toolbar.link.click();
    assert.ok(component.popup.activated, 'popup is visible');
    assert.strictEqual(component.popup.errors.length, 0);

    await component.popup.form.insert.submit();

    assert.ok(component.popup.activated, 'popup is still visible');
    assert.strictEqual(component.popup.errors.length, 2);
    assert.strictEqual(component.popup.errors[0].text, 'Link URL can not be blank');
    assert.strictEqual(component.popup.errors[1].text, 'Link Text can not be blank');
  });

  todo('it edits existing link and retains properties', async function (assert) {
    const editor = '.html-editor';
    const tooltip = '.ql-tooltip';
    const link1 = { href: 'https://iliosproject.org', text: 'Ilios Project' };
    const link2 = { href: 'https://github.com/ilios' };

    this.set('description', '');
    this.set('changeDescription', (value) => {
      this.description = value;
    });
    await render(
      <template>
        <HtmlEditor @content={{this.description}} @update={{this.changeDescription}} />
      </template>,
    );

    await component.toolbar.link.click();
    await component.popup.form.url.edit(link1.href);
    await component.popup.form.text.edit(link1.text);
    await component.popup.form.insert.submit();

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

    // TODO: can't get any keyboard or mouse triggers to work in editor
    //       after submitting the link
    // this should move the cursor to the left position
    // which will trigger the tooltip to edit link
    await component.editor.content.focus();
    await triggerKeyEvent(editor, 'keyup', 'ArrowLeft');
    await component.editor.content.linkTooltip.openEditor();

    await component.editor.content.linkTooltip.edit(link2.href);
    await triggerKeyEvent(tooltip, 'keydown', 'Enter');

    assert.strictEqual(
      component.editor.content.textContent,
      'Ilios Project',
      'editor has correct text',
    );
    assert.strictEqual(
      component.editor.content.htmlContent,
      '<p><a href="https://github.com/ilios" rel="noopener noreferrer">Ilios Project</a></p>',
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

    await component.editor.content.edit(newText);
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
