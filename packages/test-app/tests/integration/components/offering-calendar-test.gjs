import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { DateTime } from 'luxon';
import OfferingCalendar from 'ilios-common/components/offering-calendar';

module('Integration | Component | offering-calendar', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('shows events', async function (assert) {
    const today = DateTime.fromObject({ hour: 8 });
    const tomorrow = today.plus({ day: 1 });
    const school = this.server.create('school');
    const course = this.server.create('course', { school });
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
    await render(
      <template>
        <OfferingCalendar
          @learnerGroups={{this.learnerGroups}}
          @session={{this.session}}
          @startDate={{this.startDate}}
          @endDate={{this.endDate}}
        />
      </template>,
    );
    const events = '[data-test-calendar-event]';
    assert.dom(events).exists({ count: 4 });
  });
});
