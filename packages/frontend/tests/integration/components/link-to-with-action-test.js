import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'frontend/tests/pages/components/link-to-with-action';

module('Integration | Component | link-to-with-action', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('content', 'Link Text');
    await render(hbs`
      <LinkToWithAction @route="dashboard">
        {{this.content}}
      </LinkToWithAction>`);

    assert.strictEqual(component.text, 'Link Text');
    assert.strictEqual(component.url, '/dashboard');
    assert.notOk(component.isActive);
  });
});
