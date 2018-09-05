import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click, findAll, fillIn, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | search box', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`{{search-box}}`);

    assert.equal(findAll('input[type=search]').length, 1);
  });

  test('clicking search calls search', async function(assert) {
    this.set('search', value => {
      assert.equal(value, '');
    });
    await render(hbs`{{search-box search=(action search)}}`);
    const searchBoxIcon = '.search-icon';
    await click(searchBoxIcon);

    return settled();
  });

  test('typing calls search', async function(assert) {
    this.set('search', value => {
      assert.equal(value, 'typed it');
    });
    await render(hbs`{{search-box search=(action search)}}`);
    run(async () => {
      await fillIn('input', 'typed it');
      await triggerEvent('input', 'input');
      this.$('input').trigger('keyup', {which: 50});
    });
    //wait for debounce timer in component
    return settled();
  });

  test('escape calls clear', async function(assert) {
    this.set('clear', () => {
      assert.ok(true);
    });
    this.set('nothing', () => { });
    await render(hbs`{{search-box search=(action nothing) clear=(action clear)}}`);
    run(async () => {
      await fillIn('input', 'typed it');
      await triggerEvent('input', 'change');
      this.$('input').trigger($.Event('keyup', { keyCode: 27 }));
    });
  });
});
