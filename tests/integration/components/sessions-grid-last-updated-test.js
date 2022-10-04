import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { DateTime } from 'luxon';

module('Integration | Component | sessions-grid-last-updated', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  //reset locale for other tests
  hooks.afterEach(function () {
    this.owner.lookup('service:intl').setLocale('en-us');
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
    await render(hbs`<SessionsGridLastUpdated @session={{this.session}} />`);
    const lastUpdatedText = () => {
      const date = this.intl.formatDate(session.updatedAt, {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      });

      const text = this.intl.t('general.lastUpdate');

      return `${text}: ${date}`;
    };

    assert.dom(this.element).containsText(lastUpdatedText());
    this.owner.lookup('service:intl').setLocale('es');
    await settled();
    assert.dom(this.element).containsText(lastUpdatedText());
    this.owner.lookup('service:intl').setLocale('fr');
    await settled();
    assert.dom(this.element).containsText(lastUpdatedText());
  });
});
