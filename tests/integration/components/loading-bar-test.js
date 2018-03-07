import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { later } from '@ember/runloop';

module('Integration | Component | loading bar', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    const bar = '.bar';
    this.set('isLoading', true);
    await render(hbs`{{loading-bar isLoading=isLoading}}`);
    // we need to give the bar a moment to actually change state
    later(() => {
      assert.ok(find(bar).getAttribute('value').trim() > 0);
      this.set('isLoading', false);
      later(() => {
        assert.equal(find(bar).getAttribute('value').trim(), 0);
      }, 2000);
    }, 500);
    await settled();
  });
});
