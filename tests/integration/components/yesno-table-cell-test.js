import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | yesno table cell', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders yes', async function(assert) {
    await render(hbs`{{yesno-table-cell value=true}}`);
    assert.equal(find('*').textContent.trim(), 'Yes');
    assert.ok(find('div').classList.contains('yes'));
  });

  test('it renders no', async function(assert) {
    await render(hbs`{{yesno-table-cell value=false}}`);
    assert.equal(find('*').textContent.trim(), 'No');
    assert.ok(find('div').classList.contains('no'));
  });
});
