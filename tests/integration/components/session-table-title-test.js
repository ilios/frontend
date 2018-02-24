import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | session table title', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders with a link', async function(assert) {
    const i = 'i';
    await render(hbs`{{session-table-title value='test'}}`);

    assert.equal(this.$().text().trim(), 'test');
    assert.ok(this.$(i).hasClass('fa-external-link-square'));
  });
});