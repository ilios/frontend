import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | pagedlist controls', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {

    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });" + EOL + EOL +

    await render(hbs`{{pagedlist-controls limit=4 offset=11 total=33}}`);

    assert.equal(find('*').textContent.replace(/[\t\n\s]+/g, ""), 'Showing12-15of33102550PerPage');
  });
});
