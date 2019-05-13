import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { component } from 'ilios/tests/pages/components/global-search-box';

module('Integration | Component | global search box', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`{{global-search-box}}`);

    assert.dom('input[type=search]').exists({ count: 1 });
  });

  test('clicking search focuses input', async function(assert) {
    this.set('search', () => {
      assert.ok(false);
    });
    await render(hbs`{{global-search-box search=(action search)}}`);
    await component.clickIcon();
    assert.ok(component.inputHasFocus);
  });

  test('clicking search searches if there is content', async function(assert) {
    this.set('search', value => {
      assert.equal(value, 'typed it');
    });
    await render(hbs`{{global-search-box search=(action search)}}`);
    await component.input('typed it');
    await component.clickIcon();
  });

  test('typing start autocomplete', async function(assert) {
    this.set('search', value => {
      assert.equal(value, 'typed it');
    });
    await render(hbs`{{global-search-box search=(action search)}}`);
    await component.input('typed it');
    await component.triggerInput();
    assert.equal(component.autocompleteResults.length, 3);
  });

  //@todo implement keybindings
  // test('escape calls clear', async function(assert) {
  //   this.set('nothing', () => { });
  //   await render(hbs`{{global-search-box search=(action nothing)}}`);
  //   await component.input('typed it');
  //   assert.ok(component.autocompleteResults.length, 3);
  //   await component.escape();
  //   assert.ok(component.autocompleteResults.length, 0);
  //   assert.equal(component.inputValue, '');
  // });
});
