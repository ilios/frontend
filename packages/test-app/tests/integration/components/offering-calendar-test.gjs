import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { array } from '@ember/helper';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { DateTime } from 'luxon';
import OfferingCalendar from 'ilios-common/components/offering-calendar';
import { component } from 'ilios-common/page-objects/components/offering-calendar';

module('Integration | Component | offering-calendar', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const startDate = DateTime.fromISO('2026-03-31T09:00:00');
    const endDate = startDate.plus({ hour: 8 });
    const school = this.server.create('school');
    const course = this.server.create('course', { school });
    const sessionType = this.server.create('session-type');
    const session = this.server.create('session', {
      course,
      sessionType,
    });
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', session.id);

    this.set('startDate', startDate.toJSDate());
    this.set('endDate', endDate.toJSDate());
    this.set('session', sessionModel);
    await render(
      <template>
        <OfferingCalendar
          @learnerGroups={{(array)}}
          @session={{this.session}}
          @startDate={{this.startDate}}
          @endDate={{this.endDate}}
        />
      </template>,
    );
    assert.strictEqual(component.title, 'Calendar');
    assert.ok(
      component.filters.learnerGroupEvents.toggle.checked,
      'learner group events filter is on by default',
    );
    assert.strictEqual(
      component.filters.learnerGroupEvents.label,
      'Show all events for assigned learner groups',
    );
    assert.ok(
      component.filters.sessionEvents.toggle.checked,
      'session events filter is on by default',
    );
    assert.strictEqual(component.filters.sessionEvents.label, 'Show all other session 0 events');
    assert.strictEqual(
      component.weeklyCalendar.calendar.title.longWeekOfYear,
      'Week of March 29, 2026',
    );
  });

  test('shows events', async function (assert) {
    const startDate = DateTime.fromISO('2026-03-31T08:00:00');
    const endDate = startDate.plus({ hours: 8 });
    const startOfWeek = startDate.minus({ day: 2 }).set({ hour: 0, minute: 0, second: 0 });
    const endOfWeek = startDate.plus({ day: 4 }).set({ hour: 22, minute: 59, second: 59 });
    const school = this.server.create('school');
    const course = this.server.create('course', { school });
    const sessionType = this.server.create('session-type');
    const session = this.server.create('session', {
      course,
      sessionType,
    });
    const session2 = this.server.create('session', {
      course,
      sessionType,
    });
    const offering1 = this.server.create('offering', {
      startDate: startOfWeek.toJSDate(),
      endDate: startOfWeek.plus({ hour: 1 }).toJSDate(),
      location: 123,
      session,
    });
    const offering2 = this.server.create('offering', {
      startDate: endOfWeek.toJSDate(),
      endDate: endOfWeek.plus({ hour: 1 }).toJSDate(),
      location: 123,
      session,
    });
    const offering3 = this.server.create('offering', {
      startDate: startDate.plus({ day: 1, hour: 1}).toJSDate(),
      endDate: startDate.plus({ day: 1, hour: 2 }).toJSDate(),
      location: 123,
      session: session2,
    });
    const learnerGroup = this.server.create('learner-group', {
      offerings: [offering1, offering2],
    });
    const learnerGroup2 = this.server.create('learner-group', {
      offerings: [offering3],
    });

    const sessionModel = await this.owner.lookup('service:store').findRecord('session', session.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
    const learnerGroupModel2 = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup2.id);

    this.set('startDate', startDate.toJSDate());
    this.set('endDate', endDate.toJSDate());
    this.set('session', sessionModel);
    this.set('learnerGroups', [learnerGroupModel, learnerGroupModel2]);
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
    assert.strictEqual(component.weeklyCalendar.calendar.events.length, 4);
    assert.ok(component.weeklyCalendar.calendar.events[0].isFirstDayOfWeek);
    assert.strictEqual(component.weeklyCalendar.calendar.events[0].time, '12:00 AM');
    assert.ok(component.weeklyCalendar.calendar.events[1].isThirdDayOfWeek);
    assert.strictEqual(component.weeklyCalendar.calendar.events[1].time, '08:00 AM');
    assert.ok(component.weeklyCalendar.calendar.events[2].isFourthDayOfWeek);
    assert.strictEqual(component.weeklyCalendar.calendar.events[2].time, '09:00 AM');
    assert.ok(component.weeklyCalendar.calendar.events[3].isSeventhDayOfWeek);
    assert.strictEqual(component.weeklyCalendar.calendar.events[3].time, '10:59 PM');
  });
});
