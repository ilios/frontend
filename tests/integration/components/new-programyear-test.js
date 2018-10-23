import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import tHelper from "ember-intl/helper";

module('Integration | Component | new programyear', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.owner.lookup('service:intl').setLocale('en');
    this.owner.register('helper:t', tHelper);
  });

  test('it renders', async function(assert) {
    assert.expect(1);
    this.set('nothing', parseInt);

    await render(hbs`{{new-programyear save=(action nothing) cancel=(action nothing)}}`);

    assert.ok(find('.title').textContent.search(/New Program Year/) === 0);
  });
});
