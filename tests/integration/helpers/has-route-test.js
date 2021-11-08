import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | has-route', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders on a known route', async function (assert) {
    this.set('route', 'dashboard');
    await render(hbs`{{if (has-route this.route) 'true' 'false'}}`);
    assert.dom(this.element).hasText('true');
  });

  test('it renders on an unknown route', async function (assert) {
    this.set('route', 'geflarknik');
    await render(hbs`{{if (has-route this.route) 'true' 'false'}}`);
    assert.dom(this.element).hasText('false');
  });
});
