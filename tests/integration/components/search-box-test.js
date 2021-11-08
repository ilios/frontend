import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn, find, triggerKeyEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | search box', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<SearchBox />`);

    assert.dom('input[type=search]').exists({ count: 1 });
  });

  test('clicking search calls search', async function (assert) {
    assert.expect(1);
    this.set('search', (value) => {
      assert.strictEqual(value, '');
    });
    await render(hbs`<SearchBox @search={{this.search}} />`);
    const searchBoxIcon = '.search-icon';
    await click(searchBoxIcon);
  });

  test('typing calls search', async function (assert) {
    assert.expect(1);
    this.set('search', (value) => {
      assert.strictEqual(value, 'typed it');
    });
    await render(hbs`<SearchBox @search={{this.search}} />`);
    await fillIn('input', 'typed it');
  });

  test('escape calls clear', async function (assert) {
    assert.expect(1);
    this.set('clear', () => {
      assert.ok(true);
    });
    await render(hbs`<SearchBox @search={{(noop)}} @clear={{this.clear}} />`);
    await fillIn('input', 'typed it');
    await triggerKeyEvent('input', 'keyup', 27);
  });

  test('clicking icon sets focus', async function (assert) {
    this.set('search', () => {});
    await render(hbs`<SearchBox @search={{this.search}} />`);
    const searchBoxIcon = '.search-icon';
    await click(searchBoxIcon);
    assert.dom(find('input')).isFocused();
  });
});
