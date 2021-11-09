import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import moment from 'moment';

module('Integration | Component | sessions-grid-last-updated', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.owner.lookup('service:moment').setLocale('en');
  });

  test('it renders', async function (assert) {
    assert.expect(1);
    const session = this.server.create('session', {
      updatedAt: moment('2019-07-09 17:00:00').toDate(),
    });

    const sessionModel = await this.owner.lookup('service:store').find('session', session.id);

    this.set('session', sessionModel);
    await render(hbs`<SessionsGridLastUpdated @session={{this.session}} />`);

    assert.dom(this.element).hasText('Last Update Last Update: 07/09/2019 5:00 PM');
  });
});
