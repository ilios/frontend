import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | has-route', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders on a known route', async function (assert) {
    this.set('route', 'dashboard');
    await render(hbs`{{if (has-route this.route) "true" "false"}}
`);
    assert.dom(this.element).hasText('true');
  });

  test('it renders on an unknown route', async function (assert) {
    this.set('route', 'geflarknik');
    await render(hbs`{{if (has-route this.route) "true" "false"}}
`);
    assert.dom(this.element).hasText('false');
  });
});
