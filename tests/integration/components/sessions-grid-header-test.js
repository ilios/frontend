import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | sessions-grid-header', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('nothing', () => { });
    await render(hbs`<SessionsGridHeader @sortBy="title" @toggleExpandAll={{action nothing}} />`);

    assert.dom('span').exists({ count: 10 });
  });
});
