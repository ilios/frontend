import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | update notification', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders', async function (assert) {
    await render(hbs`<UpdateNotification />`);
    assert
      .dom(this.element)
      .hasText(
        "Huzzah! We've made Ilios better. You will get the new stuff on your next login, or click to update now."
      );
  });
});
