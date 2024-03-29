import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import Service from '@ember/service';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { DateTime } from 'luxon';
import { create } from 'ember-cli-page-object';
import table from 'ilios-common/page-objects/components/sessions-grid-offering-table';

const page = create({ table });

module('Integration | Component | sessions-grid-offering-table', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);
  test('it renders', async function (assert) {
    class PermissionCheckerStub extends Service {
      canDeleteSession() {
        return true;
      }
      canUpdateSession() {
        return true;
      }
    }

    this.owner.register('service:permissionChecker', PermissionCheckerStub);
    const session = this.server.create('session');
    this.server.createList('offering', 3, {
      session,
      startDate: DateTime.fromObject({ hour: 8 }).toJSDate(),
      endDate: DateTime.fromObject({ hour: 9 }).toJSDate(),
    });
    this.server.createList('offering', 3, {
      session,
      startDate: DateTime.fromObject({ hour: 9 }).toJSDate(),
      endDate: DateTime.fromObject({ hour: 8 }).plus({ minutes: 110 }).toJSDate(),
    });
    this.server.createList('offering', 3, {
      session,
      startDate: DateTime.fromObject({ hour: 9 }).plus({ day: 1 }).toJSDate(),
      endDate: DateTime.fromObject({ hour: 10 }).plus({ day: 1 }).toJSDate(),
    });
    const model = await this.owner.lookup('service:store').findRecord('session', session.id);
    this.set('model', model);

    await render(hbs`<SessionsGridOfferingTable @session={{this.model}} />
`);

    assert.strictEqual(page.table.dates.length, 2);
    assert.strictEqual(page.table.offerings.length, 9);
  });
});
