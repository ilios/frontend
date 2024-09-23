import { module, test, skip } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/fade-text';

module('Integration | Component | fade-text', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders empty', async function (assert) {
    await render(hbs`<FadeText />`);
    assert.strictEqual(component.text, '');

    await render(hbs`<FadeText></FadeText>`);
    assert.dom(this.element).hasText('');
  });

  test('it renders short text in full', async function (assert) {
    const shortText = 'template block text';
    this.set('shortText', shortText);

    await render(hbs`<FadeText @text={{this.shortText}} />
`);
    assert.strictEqual(component.text, shortText);
    assert.notOk(component.collapse.isVisible);
    assert.notOk(component.expand.isVisible);

    await render(hbs`
      <FadeText>
        {{this.shortText}}
      </FadeText>
    `);
    assert.dom(this.element).hasText(shortText);
  });

  module('fading (flaky)', () => {
    skip('it fades tall text', async function (assert) {
      const longHtml = `
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
      const fadedClass = 'is-faded';
      this.set('longHtml', longHtml);

      await render(hbs`<FadeText @text={{this.longHtml}} />`);

      assert.dom('.display-text-wrapper', this.element).hasClass(fadedClass);

      await component.expand.click();

      assert.dom('.display-text-wrapper', this.element).doesNotHaveClass(fadedClass);
      await component.collapse.click();
      assert.dom('.display-text-wrapper', this.element).hasClass(fadedClass);

      await render(hbs`
        <FadeText @text={{this.longHtml}} as |displayText expand collapse getTextDims updateTextDims isFaded expanded|>
          <div class="display-text-wrapper{{if isFaded ' is-faded'}}">
            <div
              class="display-text"
              {{!-- template-lint-disable no-at-ember-render-modifiers --}}
              {{did-insert getTextDims}}
              {{on-resize updateTextDims}}
            >
              {{displayText}}
            </div>
          </div>
          {{#if isFaded}}
          <div class="fade-text-control" data-test-fade-text-control>
            <button
              class="expand-buttons"
              aria-label={{t "general.expand"}}
              title={{t "general.expand"}}
              type="button"
              data-test-expand
              {{on "click" expand}}
            >
              <FaIcon @icon="angles-down" />
            </button>
          </div>
          {{else}}
            {{#if expanded}}
              <div class="fade-text-control" data-test-fade-text-control>
                <button
                  class="expand-buttons"
                  aria-label={{t "general.collapse"}}
                  title={{t "general.collapse"}}
                  type="button"
                  data-test-collapse
                  {{on "click" collapse}}
                >
                  <FaIcon @icon="angles-up" />
                </button>
              </div>
            {{/if}}
          {{/if}}
        </FadeText>
      `);

      assert.dom('.display-text-wrapper', this.element).hasClass(fadedClass);
      await component.expand.click();
      assert.dom('.display-text-wrapper', this.element).doesNotHaveClass(fadedClass);
      await component.collapse.click();
      assert.dom('.display-text-wrapper', this.element).hasClass(fadedClass);
    });

    skip('expand/collapse', async function (assert) {
      const longHtml = `
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
      const longText = `An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades. An objective description so long that it fades.`;
      const fadedClass = 'is-faded';
      this.set('longHtml', longHtml);
      this.set('longText', longText);
      await render(hbs`<FadeText @text={{this.longHtml}} />`);

      assert.dom('.display-text-wrapper', this.element).hasClass(fadedClass);
      assert.strictEqual(component.text, longText);
      assert.ok(component.expand.isVisible);
      assert.notOk(component.collapse.isVisible);
      await component.expand.click();
      assert.dom('.display-text-wrapper', this.element).doesNotHaveClass(fadedClass);
      assert.notOk(component.expand.isVisible);
      assert.ok(component.collapse.isVisible);
      await component.collapse.click();
      assert.dom('.display-text-wrapper', this.element).hasClass(fadedClass);
      assert.ok(component.expand.isVisible);
      assert.notOk(component.collapse.isVisible);
    });
  });
});
