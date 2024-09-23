import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { click, render } from '@ember/test-helpers';
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

  test('it fades tall text', async function (assert) {
    const longText = `${'t'.repeat(40)}\n${'t'.repeat(40)}\n${'t'.repeat(40)}\n${'t'.repeat(40)}\n${'t'.repeat(40)}\n`;
    const fadedClass = 'is-faded';
    this.set('longText', longText);

    await render(hbs`<FadeText @text={{this.longText}} />`);
    assert.dom('.display-text-wrapper', this.element).hasClass(fadedClass);
    await component.expand.click();
    assert.dom('.display-text-wrapper', this.element).doesNotHaveClass(fadedClass);
    await click('[data-test-collapse]');
    assert.dom('.display-text-wrapper', this.element).hasClass(fadedClass);

    await render(hbs`
      <FadeText @text={{this.longText}} as |displayText|>
        {{displayText}}
      </FadeText>
    `);
    assert.dom('.display-text-wrapper', this.element).hasClass(fadedClass);
    await component.expand.click();
    assert.dom('.display-text-wrapper', this.element).doesNotHaveClass(fadedClass);
    await component.collapse.click();
    assert.dom('.display-text-wrapper', this.element).hasClass(fadedClass);
  });

  test('it yields isFades when not faded', async function (assert) {
    this.set('text', 'abc');
    this.set('label', 'Expand');
    await render(hbs`
      <FadeText @text={{this.text}} as |displayText expand collapse isFaded|>
        {{isFaded}}
        <button type="button" {{on "click" expand}}>{{this.label}}</button>
      </FadeText>
    `);
    assert.dom(this.element).includesText('false');
  });

  test('it yields isFaded when faded', async function (assert) {
    const longText = `${'t'.repeat(40)}\n${'t'.repeat(40)}\n${'t'.repeat(40)}\n${'t'.repeat(40)}\n${'t'.repeat(40)}\n`;
    this.set('longText', longText);
    this.set('label', 'Expand');
    await render(hbs`
      <FadeText @text={{this.longText}} as |displayText expand collapse isFaded|>
        {{isFaded}}
        <button type="button" {{on "click" expand}}>{{this.label}}</button>
      </FadeText>
    `);
    assert.dom(this.element).includesText('true');
    await click('button');
    assert.dom(this.element).includesText('false');
  });

  test('expand/collapse', async function (assert) {
    const longText = `${'t'.repeat(40)}\n${'t'.repeat(40)}\n${'t'.repeat(40)}\n${'t'.repeat(40)}\n${'t'.repeat(40)}\n`;
    const fadedClass = 'is-faded';
    this.set('longText', longText);
    await render(hbs`<FadeText @text={{this.longText}} />`);

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
