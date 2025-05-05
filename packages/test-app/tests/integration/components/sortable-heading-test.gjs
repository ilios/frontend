import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { click, find, render } from '@ember/test-helpers';
import SortableHeading from 'ilios-common/components/sortable-heading';

module('Integration | Component | sortable heading', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders with default options', async function (assert) {
    this.set('label', 'Foo');
    await render(
      <template>
        <SortableHeading>{{this.label}}</SortableHeading>
      </template>,
    );
    assert.dom('button').hasText('Foo');
    assert.dom('button').hasClass('text-left');
    assert.dom('button').hasAttribute('title', '');
    assert.dom('svg').hasClass('fa-sort');
  });

  test('it renders', async function (assert) {
    this.set('label', 'Foo');
    const title = 'Bar';
    const align = 'right';
    this.set('title', title);
    this.set('align', 'right');
    this.set('sortedBy', true);
    this.set('sortedAscending', false);
    this.set('sortType', 'numeric');
    await render(
      <template>
        <SortableHeading
          class="ham-of-shame hide-from-small-screen"
          @colspan={{this.colspan}}
          @align={{this.align}}
          @title={{this.title}}
          @onClick={{this.click}}
          @sortedBy={{this.sortedBy}}
          @sortedAscending={{this.sortedAscending}}
          @sortType={{this.sortType}}
        >
          {{this.label}}
        </SortableHeading>
      </template>,
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
    await render(
      <template>
        <SortableHeading @onClick={{this.click}}>{{this.label}}</SortableHeading>
      </template>,
    );
    await click(find('button'));
  });
});
