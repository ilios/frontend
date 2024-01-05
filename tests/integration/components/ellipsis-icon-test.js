import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ellipsis-icon', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<EllipsisIcon />`);
    assert.dom('*').hasText('');
    assert.dom('svg').hasClass('fa-ellipsis');
    assert.dom('svg').hasClass('awesome-icon');
    assert.dom('svg use').exists();
    assert.dom('svg use').hasAttribute('xlink:href', '/fontawesome/solid.svg#ellipsis');
  });
});
