import { module, test, skip } from 'qunit';
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

  test('it passes valid data from editor to database', async function (assert) {
    // eslint-disable-next-line no-useless-escape
    const dataToInsert = `<p>hello from <strong>Quill</strong></p><p>some      text with multiple   spaces   between some words</p><p>plain text, <strong>bolded text</strong>, <em>italic text</em>, <sup>supertext</sup>, <sub>subtext</sub>, <strong>mix</strong>ed <strong><em>tex</em></strong>t</p><p>more <sup>super</sup>mi<strong>xed</strong> text that is <em>not</em> <sub><em>sub</em></sub>par, <a href="https://google.com">linked text to google</a></p><p>some text that is 'single quoted', some text that is "double quoted"</p><p>some text that is \`backticked\`, some text that is 'single "and double" quoted, \`heh heh\`'</p><p>some text in &lt;brackets&gt;, [braces], {curlies}</p><p>here are some other symbols: ~!@#$%^&amp;*()_+-=|\/?</p><p>ordered list:</p><ol><li>first ordered</li><li>second ordered</li><li>third ordered, but starting unordered<ul><li>first unordered list item inside an ordered list</li><li>second unordered list item inside an ordered list</li></ul></li></ol><p>unordered list:</p><ul><li>first unordered</li><li>second unordered</li><li>third unordered, but starting ordered<ol><li>first ordered list item inside an unordered list</li><li>second ordered list item inside an unordered list</li></ol></li></ul>`;
    // eslint-disable-next-line no-useless-escape
    const dataToSave = `<p>hello from <strong>Quill</strong></p><p>some &nbsp; &nbsp; &nbsp;text with multiple &nbsp; spaces &nbsp; between some words</p><p>plain text, <strong>bolded text</strong>, <em>italic text</em>, <sup>supertext</sup>, <sub>subtext</sub>, <strong>mix</strong>ed <strong><em>tex</em></strong>t</p><p>more <sup>super</sup>mi<strong>xed</strong> text that is <em>not</em> <sub><em>sub</em></sub>par, <a href=\"https://google.com\">linked text to google</a></p><p>some text that is &#39;single quoted&#39;, some text that is &quot;double quoted&quot;</p><p>some text that is \`backticked\`, some text that is &#39;single &quot;and double&quot; quoted, \`heh heh\`&#39;</p><p>some text in &lt;brackets&gt;, [braces], {curlies}</p><p>here are some other symbols: ~!@#$%^&amp;*()_+-=|/?</p><p>ordered list:</p><ul><li>first ordered</li><li>second ordered</li><li>third ordered, but starting unordered</li></ul><p>unordered list:</p><p></p>`;

    this.set('content', '');
    this.set('updateContent', (value) => {
      this.content = value;
    });
    await render(
      <template><HtmlEditor @content={{this.content}} @update={{this.updateContent}} /></template>,
    );

    await component.editor.content.edit(dataToInsert);
    assert.strictEqual(this.content, dataToSave, 'data passed to database is valid');
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

  skip('it edits existing link and retains properties', async function (assert) {
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
});
