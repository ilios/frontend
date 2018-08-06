import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | sessions-grid', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('sessions', []);
    this.set('sortBy', 'title');
    this.set('setSortBy', () => { });
    await render(hbs`{{sessions-grid
      sessions=sessions
      sortBy=sortBy
      setSortBy=(action setSortBy)
    }}`);

    assert.equal(this.element.textContent.trim(), '');
  });
});
