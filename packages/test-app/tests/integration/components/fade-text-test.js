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
    assert.strictEqual(component.text, '', 'has no text');

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
    assert.expect(5);
    this.set('longHtml', this.longHtml);

    this.set('expanded', false);
    this.set('onExpandAll', (isExpanded) => {
      this.set('expanded', isExpanded);
      assert.strictEqual(this.expanded, isExpanded);
    });
    await render(
      hbs`<FadeText @text={{this.longHtml}} @expanded={{this.expanded}} @onExpandAll={{this.onExpandAll}} />`,
    );

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
    assert.expect(5);
    this.set('longHtml', this.longHtml);

    this.set('expanded', false);
    this.set('onExpandAll', (isExpanded) => {
      this.set('expanded', isExpanded);
      assert.strictEqual(this.expanded, isExpanded);
    });

    await render(hbs`<FadeText
  @text={{this.longHtml}}
  @expanded={{this.expanded}}
  @onExpandAll={{this.onExpandAll}}
  as |displayText expand collapse updateTextDims isFaded expanded|
>
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
    assert.expect(12);
    const longText = `An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades.`;
    this.set('longHtml', this.longHtml);
    this.set('longText', longText);

    this.set('expanded', false);
    this.set('onExpandAll', (isExpanded) => {
      this.set('expanded', isExpanded);
      assert.strictEqual(this.expanded, isExpanded);
    });
    await render(
      hbs`<FadeText @text={{this.longHtml}} @expanded={{this.expanded}} @onExpandAll={{this.onExpandAll}} />`,
    );

    // slight delay to allow for proper loading of component
    await waitFor(this.fadedSelector);

    assert.dom('.display-text-wrapper', this.element).hasClass(this.fadedClass);
    assert.strictEqual(component.text, longText, 'component text matches');
    assert.ok(component.expand.isVisible, 'expand button is visible');
    assert.notOk(component.collapse.isVisible, 'collapse button is NOT visible');

    await component.expand.click();

    assert.dom('.display-text-wrapper', this.element).doesNotHaveClass(this.fadedClass);
    assert.notOk(component.expand.isVisible, 'expand button is NOT visible');
    assert.ok(component.collapse.isVisible, 'collpase button is visible');

    await component.collapse.click();

    // slight delay to allow for proper loading of component
    await waitFor(this.fadedSelector);

    assert.dom('.display-text-wrapper', this.element).hasClass(this.fadedClass);
    assert.ok(component.expand.isVisible);
    assert.notOk(component.collapse.isVisible);
  });
});
