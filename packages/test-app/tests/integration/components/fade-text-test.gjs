import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render, waitFor } from '@ember/test-helpers';
import { component } from 'ilios-common/page-objects/components/fade-text';
import FadeText from 'ilios-common/components/fade-text';
import onResize from 'ember-on-resize-modifier/modifiers/on-resize';
import { on } from '@ember/modifier';

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

    await render(
      <template>
        <FadeText>
          {{this.shortText}}
        </FadeText>
      </template>,
    );
    assert.dom(this.element).hasText(shortText);
  });

  test('it fades tall text given as component argument', async function (assert) {
    this.set('longHtml', this.longHtml);

    this.set('expanded', false);
    this.set('onExpandAll', (isExpanded) => {
      this.set('expanded', isExpanded);
    });
    await render(
      <template>
        <FadeText
          @text={{this.longHtml}}
          @expanded={{this.expanded}}
          @onExpandAll={{this.onExpandAll}}
        />
      </template>,
    );

    // slight delay to allow for proper loading of component
    await waitFor(this.fadedSelector);

    assert.false(this.expanded);
    assert.dom('.display-text-wrapper', this.element).hasClass(this.fadedClass);

    await component.control.expand.click();

    assert.true(this.expanded);
    assert.dom('.display-text-wrapper', this.element).doesNotHaveClass(this.fadedClass);

    await component.control.collapse.click();

    // slight delay to allow for proper loading of component
    await waitFor(this.fadedSelector);

    assert.false(this.expanded);
    assert.dom('.display-text-wrapper', this.element).hasClass(this.fadedClass);
  });

  test('it fades tall text given as block', async function (assert) {
    this.set('longHtml', this.longHtml);

    this.set('expanded', false);
    this.set('onExpandAll', (isExpanded) => {
      this.set('expanded', isExpanded);
    });

    await render(
      <template>
        <FadeText
          @text={{this.longHtml}}
          @expanded={{this.expanded}}
          @onExpandAll={{this.onExpandAll}}
          as |displayText expand collapse updateTextDims shouldFade expanded|
        >
          <div class="display-text-wrapper{{if shouldFade ' faded'}}">
            <div class="display-text" {{onResize updateTextDims}}>
              {{displayText}}
            </div>
          </div>
          {{#if shouldFade}}
            <div class="fade-text-control" data-test-fade-text-control>
              <button type="button" data-test-expand {{on "click" expand}}></button>
            </div>
          {{else}}
            {{#if expanded}}
              <button type="button" data-test-collapse {{on "click" collapse}}></button>
            {{/if}}
          {{/if}}
        </FadeText>
      </template>,
    );

    // slight delay to allow for proper loading of component
    await waitFor(this.fadedSelector);

    assert.false(this.expanded);
    assert.dom('.display-text-wrapper', this.element).hasClass(this.fadedClass);

    await component.control.expand.click();

    assert.true(this.expanded);
    assert.dom('.display-text-wrapper', this.element).doesNotHaveClass(this.fadedClass);

    await component.control.collapse.click();

    // slight delay to allow for proper loading of component
    await waitFor(this.fadedSelector);

    assert.false(this.expanded);
    assert.dom('.display-text-wrapper', this.element).hasClass(this.fadedClass);
  });

  test('expand/collapse', async function (assert) {
    const longText = `An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades.`;
    this.set('longHtml', this.longHtml);
    this.set('longText', longText);

    this.set('expanded', false);
    this.set('onExpandAll', (isExpanded) => {
      this.set('expanded', isExpanded);
    });
    await render(
      <template>
        <FadeText
          @text={{this.longHtml}}
          @expanded={{this.expanded}}
          @onExpandAll={{this.onExpandAll}}
        />
      </template>,
    );

    // slight delay to allow for proper loading of component
    await waitFor(this.fadedSelector);

    assert.false(this.expanded);
    assert.ok(component.displayText.isFaded, 'text is faded');
    assert.strictEqual(component.text, longText, 'component text matches');
    assert.ok(component.control.expand.isVisible, 'expand button is visible');
    assert.notOk(component.control.collapse.isVisible, 'collapse button is NOT visible');

    await component.control.expand.click();

    assert.true(this.expanded);
    assert.notOk(component.displayText.isFaded, 'text is NOT faded');
    assert.notOk(component.control.expand.isVisible, 'expand button is NOT visible');
    assert.ok(component.control.collapse.isVisible, 'collpase button is visible');

    await component.control.collapse.click();

    // slight delay to allow for proper loading of component
    await waitFor(this.fadedSelector);

    assert.false(this.expanded);
    assert.ok(component.displayText.isFaded, 'text is faded');
    assert.ok(component.control.expand.isVisible, 'expand button is visible');
    assert.notOk(component.control.collapse.isVisible, 'collapse button is NOT visible');
  });
});
