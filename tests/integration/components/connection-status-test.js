import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | connection status', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders offline and therefor hidden', async function(assert) {
    await render(hbs`{{connection-status}}`);
    assert.notOk(this.$().hasClass('offline'));
  });
});
