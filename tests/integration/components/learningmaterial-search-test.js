import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | learningmaterial search', function(hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  test('it renders', async function(assert) {
    assert.expect(1);
    await render(hbs`{{learningmaterial-search}}`);

    assert.equal(this.element.textContent.trim(), '');
  });
});
