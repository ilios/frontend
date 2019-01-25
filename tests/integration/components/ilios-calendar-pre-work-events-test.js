import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | ilios-calendar-pre-work-events', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`{{ilios-calendar-pre-work-events}}`);

    assert.equal(this.element.textContent.trim(), '');
  });
});
