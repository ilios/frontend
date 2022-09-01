import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | sessions-grid-loading', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders', async function (assert) {
    await render(hbs`<SessionsGridLoading @count={{5}} />`);

    assert.dom('[data-test-row]').exists({ count: 5 });
  });
});
