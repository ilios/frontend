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
    // we need to give the bar a moment to actually change state and we
    // cannot use wait here because the task actually keeps running forever preventing
    // any kind of settled state
    later(() => {
      assert.ok(find(bar).getAttribute('value').trim() > 0);
      this.set('isLoading', false);
      later(() => {
        assert.equal(find(bar).getAttribute('value').trim(), 0);
      }, 2000);
    }, 1000);
    await settled();
  });
});
