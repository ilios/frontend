import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | course/sessions-loading', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`<Course::SessionsLoading @sessionsCount={{2}} />`);

    assert.dom('[data-test-title]').hasText('Sessions (2)');
    assert.dom('[data-test-row]').exists({ count: 2 });
  });
});
