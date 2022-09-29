import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { DateTime } from 'luxon';

module('Integration | Component | sessions-grid-last-updated', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders', async function (assert) {
    assert.expect(1);
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

    assert.dom(this.element).hasText('Last Update Last Update: 07/09/2019 5:00 PM');
  });
});
