import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { click, find, render } from '@ember/test-helpers';
import SortableTh from 'ilios-common/components/sortable-th';

module('Integration | Component | sortable th', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders with default options', async function (assert) {
    this.set('label', 'Foo');
    await render(
      <template>
        <SortableTh>{{this.label}}</SortableTh>
      </template>,
    );
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
    this.set('align', 'right');
    this.set('sortedBy', true);
    this.set('sortedAscending', true);
    this.set('sortType', 'numeric');
    await render(
      <template>
        <SortableTh
          class="hide-from-small-screen"
          @colspan={{this.colspan}}
          @align={{this.align}}
          @title={{this.title}}
          @onClick={{this.click}}
          @sortedBy={{this.sortedBy}}
          @sortedAscending={{this.sortedAscending}}
          @sortType={{this.sortType}}
        >
          {{this.label}}
        </SortableTh>
      </template>,
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
      <template>
        <SortableTh
          @sortedBy={{this.sortedBy}}
          @sortedAscending={{this.sortedAscending}}
          @sortType={{this.sortType}}
        >
          {{this.label}}
        </SortableTh>
      </template>,
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
      <template>
        <SortableTh
          @sortedBy={{this.sortedBy}}
          @sortedAscending={{this.sortedAscending}}
          @sortType={{this.sortType}}
        >
          {{this.label}}
        </SortableTh>
      </template>,
    );
    assert.dom('svg').hasClass('fa-arrow-down-1-9');
    assert.dom('th').hasAttribute('aria-sort', 'ascending');
  });

  test('no sort order specified defaults to ascending sort', async function (assert) {
    this.set('sortedBy', true);
    this.set('sortType', 'numeric');
    this.set('label', 'Foo');
    await render(
      <template>
        <SortableTh
          @sortedBy={{this.sortedBy}}
          @sortType={{this.sortType}}
        >{{this.label}}</SortableTh>
      </template>,
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
    await render(
      <template>
        <SortableTh @onClick={{this.click}}>{{this.label}}</SortableTh>
      </template>,
    );
    await click(find('th button'));
  });
});
