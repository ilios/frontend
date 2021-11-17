import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { click, find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | sortable heading', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders with default options', async function (assert) {
    assert.expect(5);
    await render(hbs`<SortableHeading>Foo</SortableHeading>`);
    assert.dom('span').hasText('Foo');
    assert.dom('span').hasClass('text-left');
    assert.dom('span').hasNoClass('hide-from-small-screen');
    assert.dom('span').hasAttribute('title', '');
    assert.dom('svg').hasClass('fa-sort');
  });

  test('it renders', async function (assert) {
    assert.expect(6);
    const title = 'Bar';
    const align = 'right';
    this.set('title', title);
    this.set('hideFromSmallScreen', true);
    this.set('align', 'right');
    this.set('sortedBy', true);
    this.set('sortedAscending', false);
    this.set('sortType', 'numeric');
    await render(
      hbs`<SortableHeading
            class="ham-of-shame"
            @colspan={{this.colspan}}
            @align={{this.align}}
            @title={{this.title}}
            @onClick={{this.click}}
            @hideFromSmallScreen={{this.hideFromSmallScreen}}
            @sortedBy={{this.sortedBy}}
            @sortedAscending={{this.sortedAscending}}
            @sortType={{this.sortType}}
          >
            Foo
          </SortableHeading>`
    );
    assert.dom('span').hasText('Foo');
    assert.dom('span').hasClass(`text-${align}`);
    assert.dom('span').hasClass('hide-from-small-screen');
    assert.dom('span').hasClass('ham-of-shame');
    assert.dom('span').hasAttribute('title', title);
    assert.dom('svg').hasClass('fa-sort-numeric-down');
  });
  test('click event fires', async function (assert) {
    assert.expect(1);
    this.set('click', () => {
      assert.ok(true);
    });
    await render(hbs`<SortableHeading @onClick={{this.click}}>Foo</SortableHeading>`);
    await click(find('span'));
  });
});
