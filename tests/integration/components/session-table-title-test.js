import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | session table title', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders with a link', async function(assert) {
    const i = 'i';
    await render(hbs`{{session-table-title value='test'}}`);

    assert.equal(find('*').textContent.trim(), 'test');
    assert.ok(find(i).classList.contains('fa-external-link-square'));
  });
});
