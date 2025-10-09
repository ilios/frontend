import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import { component } from 'ilios-common/page-objects/components/fade-text';
import FadeText from 'ilios-common/components/fade-text';

module('Integration | Component | fade-text', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.longHtml = `
      An objective description so long that it fades.<br />
      An objective description so long that it fades.<br />
      An objective description so long that it fades.<br />
      An objective description so long that it fades.<br />
      An objective description so long that it fades.<br />
      An objective description so long that it fades.<br />
      An objective description so long that it fades.<br />
      An objective description so long that it fades.<br />
      An objective description so long that it fades.<br />
      An objective description so long that it fades.<br />
      An objective description so long that it fades.<br />
      An objective description so long that it fades.<br />
      An objective description so long that it fades.<br />
      An objective description so long that it fades.
    `;
    this.fadedClass = 'faded';
    this.fadedSelector = '.faded';
    this.linkText = '<p class="text"><a href="iliosproject.org">Ilios Project</a></p>';
    this.cleanText = '<p class="text"><span class="link">Ilios Project</span></p>';
  });

  test('it renders empty', async function (assert) {
    await render(<template><FadeText /></template>);
    assert.strictEqual(component.text, '', 'has no text');

    await render(<template><FadeText /></template>);
    assert.dom(this.element).hasText('');
  });

  test('it renders short text in full', async function (assert) {
    const shortText = 'template block text';
    this.set('shortText', shortText);
    await render(<template><FadeText @text={{this.shortText}} /></template>);
    assert.notOk(component.enabled);
    assert.false(component.displayText.isFaded);
    assert.dom(this.element).hasText(shortText);
  });

  test('it fades tall text given as component argument', async function (assert) {
    this.set('longHtml', this.longHtml);

    this.set('expanded', false);
    this.set('setExpanded', (isExpanded) => {
      this.set('expanded', isExpanded);
    });
    await render(
      <template><FadeText @text={{this.longHtml}} @setExpanded={{this.setExpanded}} /></template>,
    );
    assert.ok(component.enabled);
    assert.notOk(this.expanded, 'text is not expanded');
    assert.ok(component.displayText.isFaded);

    await component.control.expand.click();

    assert.ok(component.enabled);
    assert.ok(this.expanded);
    assert.notOk(component.displayText.isFaded);

    await component.control.collapse.click();

    assert.ok(component.enabled);
    assert.notOk(this.expanded);
    assert.ok(component.displayText.isFaded);
  });

  test('it renders short text in full in block form', async function (assert) {
    const shortText = 'template block text';
    this.set('shortText', shortText);
    await render(
      <template>
        <FadeText @text={{this.shortText}} as |ft|>
          {{ft.text}}
          {{ft.controlls}}
        </FadeText>
      </template>,
    );
    assert.notOk(component.enabled);
    assert.false(component.displayText.isFaded);
    assert.dom(this.element).hasText(shortText);
  });

  test('additional controls with faded text', async function (assert) {
    assert.expect(4);
    this.set('text', this.longHtml);
    this.set('edit', () => {
      assert.ok(true, 'edit button was clicked');
    });
    await render(
      <template>
        <FadeText @text={{this.text}}>
          <:additionalControls>
            <button type="button" {{on "click" this.edit}}>{{t "general.edit"}}</button>
          </:additionalControls>
        </FadeText>
      </template>,
    );
    assert.strictEqual(component.control.buttons.length, 2);
    assert.strictEqual(component.control.buttons[0].text, 'Edit');
    assert.strictEqual(component.control.buttons[1].title, 'Expand');
    await component.control.buttons[0].click();
  });

  test('additional controls with un-faded text', async function (assert) {
    assert.expect(3);
    this.set('text', 'foo bar');
    this.set('edit', () => {
      assert.ok(true, 'edit button was clicked');
    });
    await render(
      <template>
        <FadeText @text={{this.text}}>
          <:additionalControls>
            <button type="button" {{on "click" this.edit}}>{{t "general.edit"}}</button>
          </:additionalControls>
        </FadeText>
      </template>,
    );
    assert.strictEqual(component.control.buttons.length, 1);
    assert.strictEqual(component.control.buttons[0].text, 'Edit');
    await component.control.buttons[0].click();
  });
});
