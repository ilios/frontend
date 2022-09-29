import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { DateTime } from 'luxon';

module('Integration | Component | offering-calendar', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('shows events', async function (assert) {
    assert.expect(1);
    const today = DateTime.fromObject({ hour: 8 });
    const tomorrow = today.plus({ day: 1 });
    const course = this.server.create('course');
    const sessionType = this.server.create('session-type');
    const session = this.server.create('session', {
      course,
      sessionType,
    });

    const offering1 = this.server.create('offering', {
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      location: 123,
      session,
    });
    const offering2 = this.server.create('offering', {
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      location: 123,
      session,
    });
    const learnerGroup = this.server.create('learner-group', {
      offerings: [offering1, offering2],
    });
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', session.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
    this.set('startDate', today.toJSDate());
    this.set('endDate', tomorrow.toJSDate());
    this.set('session', sessionModel);
    this.set('learnerGroups', [learnerGroupModel]);
    await render(hbs`<OfferingCalendar
      @learnerGroups={{this.learnerGroups}}
      @session={{this.session}}
      @startDate={{this.startDate}}
      @endDate={{this.endDate}}
    />`);
    const events = '[data-test-calendar-event]';
    assert.dom(events).exists({ count: 4 });
  });
});
