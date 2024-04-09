import { module, test } from 'qunit';
import Service from '@ember/service';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | update notification', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders when new version is available', async function (assert) {
    class NewVersionServiceMock extends Service {
      get isNewVersionAvailable() {
        return true;
      }
    }
    this.owner.register('service:newVersion', NewVersionServiceMock);
    await render(hbs`<UpdateNotification />`);
    assert
      .dom(this.element)
      .hasText(
        "Huzzah! We've made Ilios better. You will get the new stuff on your next login, or click to update now.",
      );
  });

  test('it renders empty when no new version is available', async function (assert) {
    class NewVersionServiceMock extends Service {
      get isNewVersionAvailable() {
        return false;
      }
    }
    this.owner.register('service:newVersion', NewVersionServiceMock);
    await render(hbs`<UpdateNotification />`);
    assert.dom(this.element).hasNoText();
  });
});
