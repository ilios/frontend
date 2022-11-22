import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { click, find, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | sortable heading', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders with default options', async function (assert) {
    assert.expect(5);
    this.set('label', 'Foo');
    await render(hbs`<SortableHeading>{{this.label}}</SortableHeading>
`);
    assert.dom('button').hasText('Foo');
    assert.dom('button').hasClass('text-left');
    assert.dom('button').hasNoClass('hide-from-small-screen');
    assert.dom('button').hasAttribute('title', '');
    assert.dom('svg').hasClass('fa-sort');
  });

  test('it renders', async function (assert) {
    assert.expect(6);
    this.set('label', 'Foo');
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
            {{this.label}}
          </SortableHeading>
`
    );
    assert.dom('button').hasText('Foo');
    assert.dom('button').hasClass(`text-${align}`);
    assert.dom('button').hasClass('hide-from-small-screen');
    assert.dom('button').hasClass('ham-of-shame');
    assert.dom('button').hasAttribute('title', title);
    assert.dom('svg').hasClass('fa-arrow-down-1-9');
  });
  test('click event fires', async function (assert) {
    assert.expect(1);
    this.set('label', 'Foo');
    this.set('click', () => {
      assert.ok(true);
    });
    await render(hbs`<SortableHeading @onClick={{this.click}}>{{this.label}}</SortableHeading>
`);
    await click(find('button'));
  });
});
