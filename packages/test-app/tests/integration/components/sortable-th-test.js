import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { click, find, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | sortable th', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders with default options', async function (assert) {
    this.set('label', 'Foo');
    await render(hbs`<SortableTh>{{this.label}}</SortableTh>`);
    assert.dom('th').hasText('Foo');
    assert.dom('th').hasClass('text-left');
    assert.dom('th').hasNoClass('hide-from-small-screen');
    assert.dom('th').hasAttribute('colspan', '1');
    assert.dom('th').hasAttribute('aria-sort', 'none');
    assert.dom('th button').hasAttribute('title', '');
    assert.dom('svg').hasClass('fa-sort');
  });

  test('it renders', async function (assert) {
    this.set('label', 'Foo');
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
  {{this.label}}
</SortableTh>`,
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
    this.set('label', 'Foo');
    await render(
      hbs`<SortableTh
  @sortedBy={{this.sortedBy}}
  @sortedAscending={{this.sortedAscending}}
  @sortType={{this.sortType}}
>
  {{this.label}}
</SortableTh>`,
    );
    assert.dom('svg').hasClass('fa-arrow-down-9-1');
    assert.dom('th').hasAttribute('aria-sort', 'descending');
  });

  test('sorted ascending', async function (assert) {
    this.set('sortedBy', true);
    this.set('sortedAscending', true);
    this.set('sortType', 'numeric');
    this.set('label', 'Foo');
    await render(
      hbs`<SortableTh
  @sortedBy={{this.sortedBy}}
  @sortedAscending={{this.sortedAscending}}
  @sortType={{this.sortType}}
>
  {{this.label}}
</SortableTh>`,
    );
    assert.dom('svg').hasClass('fa-arrow-down-1-9');
    assert.dom('th').hasAttribute('aria-sort', 'ascending');
  });

  test('no sort order specified defaults to ascending sort', async function (assert) {
    this.set('sortedBy', true);
    this.set('sortType', 'numeric');
    this.set('label', 'Foo');
    await render(
      hbs`<SortableTh @sortedBy={{this.sortedBy}} @sortType={{this.sortType}}>{{this.label}}</SortableTh>`,
    );
    assert.dom('svg').hasClass('fa-arrow-down-1-9');
    assert.dom('th').hasAttribute('aria-sort', 'ascending');
  });

  test('click event fires', async function (assert) {
    assert.expect(1);
    this.set('label', 'Foo');
    this.set('click', () => {
      assert.ok(true);
    });
    await render(hbs`<SortableTh @onClick={{this.click}}>{{this.label}}</SortableTh>`);
    await click(find('th button'));
  });
});
