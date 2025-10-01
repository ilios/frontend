import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
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

  test('it fades tall text given as component argument', async function (assert) {
    this.set('longHtml', this.longHtml);

    this.set('expanded', false);
    this.set('setExpanded', (isExpanded) => {
      this.set('expanded', isExpanded);
    });
    await render(
      <template>
        <FadeText @text={{this.longHtml}} @setExpanded={{this.setExpanded}} as |ft|>
          {{ft.text}}
          {{ft.controls}}
        </FadeText>
      </template>,
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
});
