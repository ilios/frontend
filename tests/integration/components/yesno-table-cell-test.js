import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | yesno table cell', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders yes', async function(assert) {
    await render(hbs`{{yesno-table-cell value=true}}`);
    assert.dom(this.element).hasText('Yes');
    assert.dom('span').hasClass('yes');
  });

  test('it renders no', async function(assert) {
    await render(hbs`{{yesno-table-cell value=false}}`);
    assert.dom(this.element).hasText('No');
    assert.dom('span').hasClass('no');
  });
});
