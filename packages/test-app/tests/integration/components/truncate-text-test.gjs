import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { click, render } from '@ember/test-helpers';
import { component } from 'ilios-common/page-objects/components/truncate-text';
import TruncateText from 'ilios-common/components/truncate-text';
import { on } from '@ember/modifier';

module('Integration | Component | truncate-text', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders empty', async function (assert) {
    await render(<template><TruncateText /></template>);
    assert.strictEqual(component.text, '');

    await render(<template><TruncateText /></template>);
    assert.dom(this.element).hasText('');
  });

  test('it renders short text in full', async function (assert) {
    const shortText = 'template block text';
    this.set('shortText', shortText);

    await render(<template><TruncateText @text={{this.shortText}} /></template>);
    assert.strictEqual(component.text, shortText);
    assert.notOk(component.collapse.isVisible);
    assert.notOk(component.expand.isVisible);

    await render(
      <template>
        <TruncateText>
          {{this.shortText}}
        </TruncateText>
      </template>,
    );
    assert.dom(this.element).hasText(shortText);
  });

  test('it truncates long text', async function (assert) {
    this.set('longText', 't'.repeat(400));

    await render(<template><TruncateText @text={{this.longText}} /></template>);
    assert.strictEqual(component.text, 't'.repeat(200));
    assert.ok(component.expand.isVisible);

    await render(
      <template>
        <TruncateText @text={{this.longText}} as |displayText|>
          {{displayText}}
        </TruncateText>
      </template>,
    );
    assert.dom(this.element).hasText('t'.repeat(200));
  });

  test('it does not truncate long text with slippage', async function (assert) {
    this.set('longText', 't'.repeat(224));

    await render(<template><TruncateText @text={{this.longText}} /></template>);
    assert.strictEqual(component.text, 't'.repeat(224));

    await render(
      <template>
        <TruncateText @text={{this.longText}} as |displayText|>
          {{displayText}}
        </TruncateText>
      </template>,
    );
    assert.dom(this.element).hasText('t'.repeat(224));
  });

  test('slippage is configurable', async function (assert) {
    this.set('longText', 't'.repeat(250));

    await render(<template><TruncateText @slippage="75" @text={{this.longText}} /></template>);
    assert.strictEqual(component.text, 't'.repeat(250));

    await render(
      <template>
        <TruncateText @slippage="75" @text={{this.longText}} as |displayText|>
          {{displayText}}
        </TruncateText>
      </template>,
    );
    assert.dom(this.element).hasText('t'.repeat(250));
  });

  test('it strips HTML in collapsedText', async function (assert) {
    this.set('longText', '<h1 data-test-headline>Text</h1>' + 't'.repeat(400));
    await render(<template><TruncateText @text={{this.longText}} /></template>);
    assert.strictEqual(component.text, 'Text' + 't'.repeat(196));
    assert.dom('[data-test-headline]').doesNotExist();

    await render(
      <template>
        <TruncateText @text={{this.longText}} as |displayText|>
          {{displayText}}
        </TruncateText>
      </template>,
    );
    assert.dom(this.element).hasText('Text' + 't'.repeat(196));
    assert.dom('[data-test-headline]').doesNotExist();
  });

  test('it strips HTML when text is short', async function (assert) {
    this.set('longText', '<h1 data-test-headline>Text</h1>');
    await render(<template><TruncateText @text={{this.longText}} /></template>);
    assert.strictEqual(component.text, 'Text');
    assert.dom('[data-test-headline]').doesNotExist();

    await render(
      <template>
        <TruncateText @text={{this.longText}} as |displayText|>
          {{displayText}}
        </TruncateText>
      </template>,
    );
    assert.dom(this.element).hasText('Text');
    assert.dom('[data-test-headline]').doesNotExist();
  });

  test('it preserves HTML when requested when text is short', async function (assert) {
    this.set('longText', '<h1 data-test-headline>Text</h1>');
    await render(
      <template><TruncateText @renderHtml={{true}} @text={{this.longText}} /></template>,
    );
    assert.strictEqual(component.text, 'Text');
    assert.dom('[data-test-headline]').exists();

    await render(
      <template>
        <TruncateText @renderHtml={{true}} @text={{this.longText}} as |displayText|>
          {{displayText}}
        </TruncateText>
      </template>,
    );
    assert.dom(this.element).hasText('Text');
    assert.dom('[data-test-headline]').exists();
  });

  test('clicking expand reveals all text', async function (assert) {
    this.set('longText', 't'.repeat(400));
    await render(<template><TruncateText @text={{this.longText}} /></template>);
    assert.strictEqual(component.text, 't'.repeat(200));
    await component.expand.click();
    assert.strictEqual(component.text, 't'.repeat(400));
  });

  test('yielded expand reveals all text', async function (assert) {
    this.set('longText', 't'.repeat(400));
    this.set('label', 'Expand');
    await render(
      <template>
        <TruncateText @text={{this.longText}} as |displayText expand|>
          {{displayText}}
          <button type="button" {{on "click" expand}}>{{this.label}}</button>
        </TruncateText>
      </template>,
    );
    assert.dom(this.element).hasText('t'.repeat(200) + ' Expand');
    await click('button');
    assert.dom(this.element).hasText('t'.repeat(400) + ' Expand');
  });

  test('it preserves HTML when expanded', async function (assert) {
    this.set('longText', '<h1>Text</h1>' + 't'.repeat(400));
    this.set('label', 'Expand');
    await render(
      <template><TruncateText @renderHtml={{true}} @text={{this.longText}} /></template>,
    );
    await component.expand.click();
    assert.dom('h1').exists();
    assert.dom('h1').hasText('Text');
    assert.strictEqual(component.text, 'Text' + 't'.repeat(400));
    await render(
      <template>
        <TruncateText @renderHtml={{true}} @text={{this.longText}} as |displayText expand|>
          {{displayText}}
          <button type="button" {{on "click" expand}}>{{this.label}}</button>
        </TruncateText>
      </template>,
    );
    await click('button');
    assert.dom('h1').exists();
    assert.dom('h1').hasText('Text');
    assert.dom(this.element).hasText('Text' + 't'.repeat(400) + ' Expand');
  });

  test('it yields isTruncated when not truncated', async function (assert) {
    this.set('text', 'abc');
    this.set('label', 'Expand');
    await render(
      <template>
        <TruncateText @text={{this.text}} as |displayText expand collapse isTruncated|>
          {{isTruncated}}
          <button type="button" {{on "click" expand}}>{{this.label}}</button>
        </TruncateText>
      </template>,
    );
    assert.dom(this.element).includesText('false');
  });

  test('it yields isTruncated when truncated', async function (assert) {
    this.set('longText', 't'.repeat(400));
    this.set('label', 'Expand');
    await render(
      <template>
        <TruncateText @text={{this.longText}} as |displayText expand collapse isTruncated|>
          {{isTruncated}}
          <button type="button" {{on "click" expand}}>{{this.label}}</button>
        </TruncateText>
      </template>,
    );
    assert.dom(this.element).includesText('true');
    await click('button');
    assert.dom(this.element).includesText('false');
  });

  test('expand/collapse', async function (assert) {
    this.set('longText', 't'.repeat(400));
    await render(<template><TruncateText @text={{this.longText}} /></template>);
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
