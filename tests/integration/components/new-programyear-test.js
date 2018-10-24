import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | new programyear', function(hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  test('it renders', async function(assert) {
    assert.expect(1);
    this.set('nothing', parseInt);

    await render(hbs`{{new-programyear save=(action nothing) cancel=(action nothing)}}`);

    assert.ok(find('.title').textContent.search(/New Program Year/) === 0);
  });
});
