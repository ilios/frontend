import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, waitFor, waitUntil } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | loading bar', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    const bar = '.bar';
    const emptyBar = '.bar[value="0"]';
    this.set('isLoading', true);

    // don't `await` this render as the internal task that never stops will keep this test running forever
    render(hbs`{{loading-bar isLoading=isLoading}}`);
    await waitUntil(() => {
      const value = parseInt(find(bar).getAttribute('value').trim(), 10);
      return value > 0;
    });
    await waitFor(bar);
    assert.ok(find(bar).getAttribute('value').trim() > 0);
    this.set('isLoading', false);
    await waitFor(emptyBar);
    assert.equal(find(bar).getAttribute('value').trim(), 0);
  });
});
