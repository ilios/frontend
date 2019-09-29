import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  click,
  fillIn,
  triggerKeyEvent
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | search box', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`<SearchBox />`);

    assert.dom('input[type=search]').exists({ count: 1 });
  });

  test('clicking search calls search', async function(assert) {
    this.set('search', value => {
      assert.equal(value, '');
    });
    await render(hbs`<SearchBox @search={{action search}} />`);
    const searchBoxIcon = '.search-icon';
    await click(searchBoxIcon);
  });

  test('typing calls search', async function(assert) {
    this.set('search', value => {
      assert.equal(value, 'typed it');
    });
    await render(hbs`<SearchBox @search={{action search}} />`);
    await fillIn('input', 'typed it');
  });

  test('escape calls clear', async function(assert) {
    this.set('clear', () => {
      assert.ok(true);
    });
    this.set('nothing', () => { });
    await render(hbs`<SearchBox @search={{action nothing}} @clear={{action clear}} />`);
    await fillIn('input', 'typed it');
    await triggerKeyEvent('input', 'keyup', 27);
  });
});
