import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { setLocale } from 'ember-intl/test-support';
import { DateTime } from 'luxon';
import SessionsGridLastUpdated from 'ilios-common/components/sessions-grid-last-updated';

module('Integration | Component | sessions-grid-last-updated', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.intl = this.owner.lookup('service:intl');
  });

  //reset locale for other tests
  hooks.afterEach(async function () {
    await setLocale('en-us');
  });

  test('it renders', async function (assert) {
    const session = this.server.create('session', {
      updatedAt: DateTime.fromObject({
        year: 2019,
        month: 7,
        day: 9,
        hour: 17,
        minute: 0,
        second: 0,
      }).toJSDate(),
    });

    const sessionModel = await this.owner.lookup('service:store').findRecord('session', session.id);

    this.set('session', sessionModel);
    await render(<template><SessionsGridLastUpdated @session={{this.session}} /></template>);
    const lastUpdatedText = () => {
      const date = this.intl.formatDate(session.updatedAt, {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const text = this.intl.t('general.lastUpdate');

      return `${text}: ${date}`;
    };

    assert.dom(this.element).containsText(lastUpdatedText());
    await setLocale('es');
    assert.dom(this.element).containsText(lastUpdatedText());
    await setLocale('fr');
    assert.dom(this.element).containsText(lastUpdatedText());
  });
});
