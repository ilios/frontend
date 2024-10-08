import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/fade-text';

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
    this.fadedClass = 'is-faded';
    this.fadedSelector = '.is-faded';
  });

  test('it renders empty', async function (assert) {
    await render(hbs`<FadeText />`);
    assert.strictEqual(component.text, '');

    await render(hbs`<FadeText />`);
    assert.dom(this.element).hasText('');
  });

  test('it renders short text in full', async function (assert) {
    const shortText = 'template block text';
    this.set('shortText', shortText);

    await render(hbs`<FadeText @text={{this.shortText}} />`);
    assert.strictEqual(component.text, shortText);
    assert.notOk(component.collapse.isVisible);
    assert.notOk(component.expand.isVisible);

    await render(hbs`<FadeText>
  {{this.shortText}}
</FadeText>`);
    assert.dom(this.element).hasText(shortText);
  });

  test('it fades tall text given as component argument', async function (assert) {
    this.set('longHtml', this.longHtml);

    await render(hbs`<FadeText @text={{this.longHtml}} />`);

    // slight delay to allow for proper loading of component
    await waitFor(this.fadedSelector);

    assert.dom('.display-text-wrapper', this.element).hasClass(this.fadedClass);

    await component.expand.click();

    assert.dom('.display-text-wrapper', this.element).doesNotHaveClass(this.fadedClass);

    await component.collapse.click();

    // slight delay to allow for proper loading of component
    await waitFor(this.fadedSelector);

    assert.dom('.display-text-wrapper', this.element).hasClass(this.fadedClass);
  });

  test('it fades tall text given as block', async function (assert) {
    this.set('longHtml', this.longHtml);

    await render(hbs`<FadeText @text={{this.longHtml}} as |displayText expand collapse updateTextDims isFaded expanded|>
  <div class='display-text-wrapper{{if isFaded " is-faded"}}'>
    <div class='display-text' {{on-resize updateTextDims}}>
      {{displayText}}
    </div>
  </div>
  {{#if isFaded}}
    <div class='fade-text-control' data-test-fade-text-control>
      <button type='button' data-test-expand {{on 'click' expand}}></button>
    </div>
  {{else}}
    {{#if expanded}}
      <button type='button' data-test-collapse {{on 'click' collapse}}></button>
    {{/if}}
  {{/if}}
</FadeText>`);

    // slight delay to allow for proper loading of component
    await waitFor(this.fadedSelector);

    assert.dom('.display-text-wrapper', this.element).hasClass(this.fadedClass);

    await component.expand.click();

    assert.dom('.display-text-wrapper', this.element).doesNotHaveClass(this.fadedClass);

    await component.collapse.click();

    // slight delay to allow for proper loading of component
    await waitFor(this.fadedSelector);

    assert.dom('.display-text-wrapper', this.element).hasClass(this.fadedClass);
  });

  test('expand/collapse', async function (assert) {
    const longText = `An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades.`;
    this.set('longHtml', this.longHtml);
    this.set('longText', longText);
    await render(hbs`<FadeText @text={{this.longHtml}} />`);

    // slight delay to allow for proper loading of component
    await waitFor(this.fadedSelector);

    assert.dom('.display-text-wrapper', this.element).hasClass(this.fadedClass);
    assert.strictEqual(component.text, longText);
    assert.ok(component.expand.isVisible);
    assert.notOk(component.collapse.isVisible);

    await component.expand.click();

    assert.dom('.display-text-wrapper', this.element).doesNotHaveClass(this.fadedClass);
    assert.notOk(component.expand.isVisible);
    assert.ok(component.collapse.isVisible);

    await component.collapse.click();

    // slight delay to allow for proper loading of component
    await waitFor(this.fadedSelector);

    assert.dom('.display-text-wrapper', this.element).hasClass(this.fadedClass);
    assert.ok(component.expand.isVisible);
    assert.notOk(component.collapse.isVisible);
  });
});
