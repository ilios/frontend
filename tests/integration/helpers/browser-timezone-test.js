import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | browser-timezone', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`{{browser-timezone}}`);

    assert.dom(this.element).hasText(Intl.DateTimeFormat().resolvedOptions().timeZone);
  });
});

