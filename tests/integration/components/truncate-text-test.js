import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/truncate-text';

module('Integration | Component | truncate-text', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders empty', async function (assert) {
    await render(hbs`<TruncateText />`);
    assert.strictEqual(component.text, '');

    await render(hbs`<TruncateText></TruncateText>`);
    assert.dom(this.element).hasText('');
  });

  test('it renders short text in full', async function (assert) {
    const shortText = 'template block text';
    this.set('shortText', shortText);

    await render(hbs`<TruncateText @text={{this.shortText}} />`);
    assert.strictEqual(component.text, shortText);
    assert.notOk(component.collapse.isVisible);
    assert.notOk(component.expand.isVisible);

    await render(hbs`
      <TruncateText>
        {{this.shortText}}
      </TruncateText>
    `);
    assert.dom(this.element).hasText(shortText);
  });

  test('it truncates long text', async function (assert) {
    this.set('longText', 't'.repeat(400));

    await render(hbs`<TruncateText @text={{this.longText}} />`);
    assert.strictEqual(component.text, 't'.repeat(200));
    assert.ok(component.expand.isVisible);

    await render(hbs`
      <TruncateText @text={{this.longText}} as |displayText|>
        Content: {{displayText}}
      </TruncateText>
    `);
    assert.dom(this.element).hasText('Content: ' + 't'.repeat(200));
  });

  test('it does not truncate long text with slippage', async function (assert) {
    this.set('longText', 't'.repeat(224));

    await render(hbs`<TruncateText @text={{this.longText}} />`);
    assert.strictEqual(component.text, 't'.repeat(224));

    await render(hbs`
      <TruncateText @text={{this.longText}} as |displayText|>
        Content: {{displayText}}
      </TruncateText>
    `);
    assert.dom(this.element).hasText('Content: ' + 't'.repeat(224));
  });

  test('slippage is configurable', async function (assert) {
    this.set('longText', 't'.repeat(250));

    await render(hbs`<TruncateText @slippage=75 @text={{this.longText}} />`);
    assert.strictEqual(component.text, 't'.repeat(250));

    await render(hbs`
      <TruncateText @slippage=75 @text={{this.longText}} as |displayText|>
        Content: {{displayText}}
      </TruncateText>
    `);
    assert.dom(this.element).hasText('Content: ' + 't'.repeat(250));
  });

  test('it strips HTML in collapsedText', async function (assert) {
    this.set('longText', '<h1 data-test-headline>Text</h1>' + 't'.repeat(400));
    await render(hbs`<TruncateText @text={{this.longText}} />`);
    assert.strictEqual(component.text, 'Text' + 't'.repeat(196));
    assert.dom('[data-test-headline]').doesNotExist();

    await render(hbs`
      <TruncateText @text={{this.longText}} as |displayText|>
        Content: {{displayText}}
      </TruncateText>
    `);
    assert.dom(this.element).hasText('Content: Text' + 't'.repeat(196));
    assert.dom('[data-test-headline]').doesNotExist();
  });

  test('it strips HTML when text is short', async function (assert) {
    this.set('longText', '<h1 data-test-headline>Text</h1>');
    await render(hbs`<TruncateText @text={{this.longText}} />`);
    assert.strictEqual(component.text, 'Text');
    assert.dom('[data-test-headline]').doesNotExist();

    await render(hbs`
      <TruncateText @text={{this.longText}} as |displayText|>
        Content: {{displayText}}
      </TruncateText>
    `);
    assert.dom(this.element).hasText('Content: Text');
    assert.dom('[data-test-headline]').doesNotExist();
  });

  test('it preserves HTML when requested when text is short', async function (assert) {
    this.set('longText', '<h1 data-test-headline>Text</h1>');
    await render(hbs`<TruncateText @renderHtml={{true}} @text={{this.longText}} />`);
    assert.strictEqual(component.text, 'Text');
    assert.dom('[data-test-headline]').exists();

    await render(hbs`
      <TruncateText @renderHtml={{true}} @text={{this.longText}} as |displayText|>
        Content: {{displayText}}
      </TruncateText>
    `);
    assert.dom(this.element).hasText('Content: Text');
    assert.dom('[data-test-headline]').exists();
  });

  test('clicking expand reveals all text', async function (assert) {
    this.set('longText', 't'.repeat(400));
    await render(hbs`<TruncateText @text={{this.longText}} />`);
    assert.strictEqual(component.text, 't'.repeat(200));
    await component.expand.click();
    assert.strictEqual(component.text, 't'.repeat(400));
  });

  test('yielded expand reveals all text', async function (assert) {
    this.set('longText', 't'.repeat(400));
    await render(hbs`
      <TruncateText @text={{this.longText}} as |displayText expand|>
        {{displayText}}
        <button {{on "click" expand}}>Expand</button>
      </TruncateText>
    `);
    assert.dom(this.element).hasText('t'.repeat(200) + ' Expand');
    await click('button');
    assert.dom(this.element).hasText('t'.repeat(400) + ' Expand');
  });

  test('it preserves HTML when expanded', async function (assert) {
    this.set('longText', '<h1>Text</h1>' + 't'.repeat(400));
    await render(hbs`<TruncateText @renderHtml={{true}} @text={{this.longText}} />`);
    await component.expand.click();
    assert.dom('h1').exists();
    assert.dom('h1').hasText('Text');
    assert.strictEqual(component.text, 'Text' + 't'.repeat(400));
    await render(hbs`
      <TruncateText @renderHtml={{true}} @text={{this.longText}} as |displayText expand|>
        {{displayText}}
        <button {{on "click" expand}}>Expand</button>
      </TruncateText>
    `);
    await click('button');
    assert.dom('h1').exists();
    assert.dom('h1').hasText('Text');
    assert.dom(this.element).hasText('Text' + 't'.repeat(400) + ' Expand');
  });

  test('it yields isTruncated when not truncated', async function (assert) {
    this.set('text', 'abc');
    await render(hbs`
      <TruncateText @text={{this.text}} as |displayText expand collapse isTruncated expanded|>
        {{isTruncated}}
        <button {{on "click" expand}}>Expand</button>
      </TruncateText>
    `);
    assert.dom(this.element).includesText('false');
  });

  test('it yields isTruncated when truncated', async function (assert) {
    this.set('longText', 't'.repeat(400));
    await render(hbs`
      <TruncateText @text={{this.longText}} as |displayText expand collapse isTruncated expanded|>
        {{isTruncated}}
        <button {{on "click" expand}}>Expand</button>
      </TruncateText>
    `);
    assert.dom(this.element).includesText('true');
    await click('button');
    assert.dom(this.element).includesText('false');
  });

  test('expand/collapse', async function (assert) {
    this.set('longText', 't'.repeat(400));
    await render(hbs`<TruncateText @text={{this.longText}} />`);
    assert.strictEqual(component.text, 't'.repeat(200));
    assert.ok(component.expand.isVisible);
    assert.notOk(component.collapse.isVisible);
    await component.expand.click();
    assert.strictEqual(component.text, 't'.repeat(400));
    assert.notOk(component.expand.isVisible);
    assert.ok(component.collapse.isVisible);
    await component.collapse.click();
    assert.strictEqual(component.text, 't'.repeat(200));
    assert.ok(component.expand.isVisible);
    assert.notOk(component.collapse.isVisible);
  });
});
