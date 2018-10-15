import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | sessions-grid-header', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('nothing', () => { });
    await render(hbs`{{sessions-grid-header sortBy='title' toggleExpandAll=(action nothing)}}`);

    assert.equal(findAll('span').length, 10);
  });
});
