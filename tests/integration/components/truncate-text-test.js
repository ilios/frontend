import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | truncate-text', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders empty', async function (assert) {
    await render(hbs`<TruncateText />`);

    assert.strictEqual(this.element.textContent.trim(), '');

    await render(hbs`
      <TruncateText>
        template block text
      </TruncateText>
    `);

    assert.strictEqual(this.element.textContent.trim(), 'template block text');
  });

  test('it truncates long text', async function (assert) {
    this.set('longText', 't'.repeat(400));
    await render(hbs`<TruncateText @text={{this.longText}} />`);
    assert.strictEqual(this.element.textContent.trim(), 't'.repeat(200));
    await render(hbs`
      <TruncateText @text={{this.longText}} as |displayText|>
        Content: {{displayText}}
      </TruncateText>
    `);

    assert.strictEqual(this.element.textContent.trim(), 'Content: ' + 't'.repeat(200));
  });

  test('it does not truncate long text with slippage', async function (assert) {
    this.set('longText', 't'.repeat(224));
    await render(hbs`<TruncateText @text={{this.longText}} />`);
    assert.strictEqual(this.element.textContent.trim(), 't'.repeat(224));
    await render(hbs`
      <TruncateText @text={{this.longText}} as |displayText|>
        Content: {{displayText}}
      </TruncateText>
    `);

    assert.strictEqual(this.element.textContent.trim(), 'Content: ' + 't'.repeat(224));
  });

  test('slippage is configurable', async function (assert) {
    this.set('longText', 't'.repeat(250));
    await render(hbs`<TruncateText @slippage=75 @text={{this.longText}} />`);
    assert.strictEqual(this.element.textContent.trim(), 't'.repeat(250));
    await render(hbs`
      <TruncateText @slippage=75 @text={{this.longText}} as |displayText|>
        Content: {{displayText}}
      </TruncateText>
    `);

    assert.strictEqual(this.element.textContent.trim(), 'Content: ' + 't'.repeat(250));
  });

  test('it strips HTML in collapsedText', async function (assert) {
    this.set('longText', '<h1>Text</h1>' + 't'.repeat(400));
    await render(hbs`<TruncateText @text={{this.longText}} />`);
    assert.strictEqual(this.element.textContent.trim(), 'Text' + 't'.repeat(196));
    await render(hbs`
      <TruncateText @text={{this.longText}} as |displayText|>
        Content: {{displayText}}
      </TruncateText>
    `);

    assert.strictEqual(this.element.textContent.trim(), 'Content: ' + 'Text' + 't'.repeat(196));
  });

  test('it strips HTML when text is short', async function (assert) {
    this.set('longText', '<h1>Text</h1>');
    await render(hbs`<TruncateText @text={{this.longText}} />`);
    assert.strictEqual(this.element.textContent.trim(), 'Text');
    await render(hbs`
      <TruncateText @text={{this.longText}} as |displayText|>
        Content: {{displayText}}
      </TruncateText>
    `);

    assert.strictEqual(this.element.textContent.trim(), 'Content: ' + 'Text');
  });

  test('it preserves HTML when requested when text is short', async function (assert) {
    this.set('longText', '<h1>Text</h1>');
    await render(hbs`<TruncateText @renderHtml={{true}} @text={{this.longText}} />`);
    assert.dom('h1').exists();
    assert.dom('h1').hasText('Text');
    await render(hbs`
      <TruncateText @renderHtml={{true}} @text={{this.longText}} as |displayText|>
        Content: {{displayText}}
      </TruncateText>
    `);
    assert.dom('h1').exists();
    assert.dom('h1').hasText('Text');
  });

  test('clicking expand reveals all text', async function (assert) {
    this.set('longText', 't'.repeat(400));
    await render(hbs`<TruncateText @text={{this.longText}} />`);
    assert.strictEqual(this.element.textContent.trim(), 't'.repeat(200));
    await click('[data-test-expand]');
    assert.strictEqual(this.element.textContent.trim(), 't'.repeat(400));
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
    await click('[data-test-expand]');
    assert.dom('h1').exists();
    assert.dom('h1').hasText('Text');
    assert.dom(this.element).includesText('t'.repeat(400));
    await render(hbs`
      <TruncateText @renderHtml={{true}} @text={{this.longText}} as |displayText expand|>
        {{displayText}}
        <button {{on "click" expand}}>Expand</button>
      </TruncateText>
    `);
    await click('button');
    assert.dom('h1').exists();
    assert.dom('h1').hasText('Text');
    assert.dom(this.element).includesText('t'.repeat(400));
  });

  test('it yields isTruncated when not truncated', async function (assert) {
    this.set('text', 'abc');
    await render(hbs`
      <TruncateText @text={{this.text}} as |displayText expand isTruncated|>
        {{isTruncated}}
        <button {{on "click" expand}}>Expand</button>
      </TruncateText>
    `);
    assert.dom(this.element).includesText('false');
  });

  test('it yields isTruncated when truncated', async function (assert) {
    this.set('longText', 't'.repeat(400));
    await render(hbs`
      <TruncateText @text={{this.longText}} as |displayText expand isTruncated|>
        {{isTruncated}}
        <button {{on "click" expand}}>Expand</button>
      </TruncateText>
    `);
    assert.dom(this.element).includesText('true');
    await click('button');
    assert.dom(this.element).includesText('false');
  });
});
