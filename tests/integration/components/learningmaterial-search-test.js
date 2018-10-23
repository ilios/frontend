import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import tHelper from "ember-intl/helper";

module('Integration | Component | learningmaterial search', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.owner.lookup('service:intl').set('locale', 'en');
    this.owner.register('helper:t', tHelper);
  });

  test('it renders', async function(assert) {
    assert.expect(1);
    await render(hbs`{{learningmaterial-search}}`);

    assert.equal(this.element.textContent.trim(), '');
  });
});
