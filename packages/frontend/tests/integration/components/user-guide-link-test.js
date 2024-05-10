import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | user-guide-link', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<UserGuideLink />`);

    assert.dom('.user-guide-link').exists();
    assert.dom('.user-guide-link svg.awesome-icon.fa-circle-question').exists();
  });
});
