import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { click, find, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | sortable th', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders with default options', async function (assert) {
    assert.expect(6);
    await render(hbs`<SortableTh>Foo</SortableTh>
`);
    assert.dom('th').hasText('Foo');
    assert.dom('th').hasClass('text-left');
    assert.dom('th').hasNoClass('hide-from-small-screen');
    assert.dom('th').hasAttribute('colspan', '1');
    assert.dom('th button').hasAttribute('title', '');
    assert.dom('svg').hasClass('fa-sort');
  });

  test('it renders', async function (assert) {
    assert.expect(6);
    const colspan = '3';
    const title = 'Bar';
    const align = 'right';
    this.set('colspan', colspan);
    this.set('title', title);
    this.set('hideFromSmallScreen', true);
    this.set('align', 'right');
    this.set('sortedBy', true);
    this.set('sortedAscending', true);
    this.set('sortType', 'numeric');
    await render(
      hbs`<SortableTh
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
          </SortableTh>
`
    );
    assert.dom('th').hasText('Foo');
    assert.dom('th').hasClass(`text-${align}`);
    assert.dom('th').hasClass('hide-from-small-screen');
    assert.dom('th').hasAttribute('colspan', colspan);
    assert.dom('th button').hasAttribute('title', title);
    assert.dom('svg').hasClass('fa-arrow-down-1-9');
  });

  test('sorted descending', async function (assert) {
    this.set('sortedBy', true);
    this.set('sortedAscending', false);
    this.set('sortType', 'numeric');
    await render(
      hbs`<SortableTh
            @sortedBy={{this.sortedBy}}
            @sortedAscending={{this.sortedAscending}}
            @sortType={{this.sortType}}
          >
            Foo
          </SortableTh>
`
    );
    assert.dom('svg').hasClass('fa-arrow-down-9-1');
  });

  test('no sort order specified defaults to ascending sort', async function (assert) {
    this.set('sortedBy', true);
    this.set('sortType', 'numeric');
    await render(
      hbs`<SortableTh @sortedBy={{this.sortedBy}} @sortType={{this.sortType}}>Foo</SortableTh>
`
    );
    assert.dom('svg').hasClass('fa-arrow-down-1-9');
  });

  test('click event fires', async function (assert) {
    assert.expect(1);
    this.set('click', () => {
      assert.ok(true);
    });
    await render(hbs`<SortableTh @onClick={{this.click}}>Foo</SortableTh>
`);
    await click(find('th button'));
  });
});
