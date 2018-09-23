import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, waitFor } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { later } from '@ember/runloop';

module('Integration | Component | loading bar', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    const bar = '.bar';
    const emptyBar = '.bar[value="0"]';
    this.set('isLoading', true);

    // don't `await` this render as the internal task that never stops will keep this test running forever
    render(hbs`{{loading-bar isLoading=isLoading}}`);
    await waitFor(bar);
    // we need to give the bar a moment to actually change state and we
    // cannot use wait here because the task actually keeps running forever preventing
    // any kind of settled state
    await later(async () => {
      assert.ok(find(bar).getAttribute('value').trim() > 0);
      this.set('isLoading', false);
      await waitFor(emptyBar);
      assert.equal(find(bar).getAttribute('value').trim(), 0);
    }, 500);
  });
});
