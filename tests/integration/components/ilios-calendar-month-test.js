import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import { component } from 'ilios-common/page-objects/components/ilios-calendar-month';

module('Integration | Component | ilios calendar month', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('month displays with three events', async function (assert) {
    const date = moment(new Date('2015-09-30T12:00:00'));
    this.set('date', date.toDate());
    const firstEvent = createUserEventObject();
    firstEvent.name = 'Some new thing';
    firstEvent.startDate = date.clone();
    firstEvent.endDate = date.clone().add(1, 'hour');
    const secondEvent = createUserEventObject();
    secondEvent.name = 'Second new thing';
    secondEvent.startDate = date.clone().add(1, 'hour');
    secondEvent.endDate = date.clone().add(3, 'hour');
    const thirdEvent = createUserEventObject();
    thirdEvent.name = 'Third new thing';
    thirdEvent.startDate = date.clone().add(3, 'hour');
    thirdEvent.endDate = date.clone().add(4, 'hour');
    this.set('events', [firstEvent, secondEvent, thirdEvent]);
    await render(hbs`<IliosCalendarMonth
      @date={{this.date}}
      @calendarEvents={{this.events}}
      @selectEvent={{(noop)}}
    />`);
    assert.strictEqual(component.calendar.monthYear, 'September 2015');
    assert.strictEqual(component.calendar.events.length, 2);
    assert.ok(component.calendar.days[29].hasShowMore);
  });

  test('month displays with two events', async function (assert) {
    const date = moment(new Date('2015-09-30T12:00:00'));
    this.set('date', date.toDate());
    const firstEvent = createUserEventObject();
    firstEvent.name = 'Some new thing';
    firstEvent.startDate = date.clone();
    firstEvent.endDate = date.clone().add(1, 'hour');
    const secondEvent = createUserEventObject();
    secondEvent.name = 'Second new thing';
    secondEvent.startDate = date.clone().add(1, 'hour');
    secondEvent.endDate = date.clone().add(3, 'hour');
    this.set('events', [firstEvent, secondEvent]);
    await render(hbs`<IliosCalendarMonth
      @date={{this.date}}
      @calendarEvents={{this.events}}
      @selectEvent={{(noop)}}
    />`);
    assert.strictEqual(component.calendar.monthYear, 'September 2015');
    assert.strictEqual(component.calendar.events.length, 2);
    assert.notOk(component.calendar.days[29].hasShowMore);
  });

  test('clicking on a day fires the correct event', async function (assert) {
    assert.expect(3);
    const date = new Date('2015-09-30T12:00:00');
    this.set('date', date);
    this.set('changeDate', (newDate) => {
      assert.ok(newDate instanceof Date);
      assert.ok(newDate.toString().includes('Tue Sep 01'));
    });
    this.set('changeView', (newView) => {
      assert.strictEqual(newView, 'day');
    });
    await render(hbs`<IliosCalendarMonth
      @date={{this.date}}
      @changeDate={{this.changeDate}}
      @changeView={{this.changeView}}
      @calendarEvents={{(array)}}
      @areDaysSelectable={{true}}
    />`);
    await component.calendar.days[0].selectDay();
  });

  test('prework', async function (assert) {
    const date = moment(new Date('2015-09-30T12:00:00'));
    const event = createUserEventObject();
    event.startDate = date.clone();
    event.endDate = date.clone().add(1, 'hour');
    event.prerequisites = [
      {
        name: 'prework 1',
        startDate: moment().format(),
        endDate: moment().format(),
        ilmSession: true,
        slug: 'whatever',
        postrequisiteSlug: 'something',
        postrequisiteName: 'third',
        isPublished: true,
        isScheduled: false,
        isBlanked: false,
      },
      {
        name: 'prework 2',
        startDate: moment().format(),
        endDate: moment().format(),
        location: 'room 111',
        ilmSession: true,
        slug: 'whatever',
        postrequisiteSlug: 'something',
        postrequisiteName: 'first',
        isPublished: true,
        isScheduled: false,
        isBlanked: false,
      },
      {
        name: 'blanked prework',
        startDate: moment().format(),
        endDate: moment().format(),
        location: 'room 111',
        ilmSession: true,
        slug: 'whatever',
        postrequisiteSlug: 'something',
        postrequisiteName: 'first',
        isPublished: true,
        isScheduled: false,
        isBlanked: true,
      },
      {
        name: 'scheduled prework',
        startDate: moment().format(),
        endDate: moment().format(),
        location: 'room 111',
        ilmSession: true,
        slug: 'whatever',
        postrequisiteSlug: 'something',
        postrequisiteName: 'first',
        isPublished: true,
        isScheduled: true,
        isBlanked: false,
      },
      {
        name: 'unpublished prework',
        startDate: moment().format(),
        endDate: moment().format(),
        location: 'room 111',
        ilmSession: true,
        slug: 'whatever',
        postrequisiteSlug: 'something',
        postrequisiteName: 'first',
        isPublished: true,
        isScheduled: true,
        isBlanked: false,
      },
    ];
    this.set('date', date.toDate());
    this.set('events', [event]);
    await render(hbs`<IliosCalendarMonth
      @date={{this.date}}
      @calendarEvents={{this.events}}
      @selectEvent={{(noop)}}
    />`);
    assert.strictEqual(component.prework.events.length, 2);
    assert.strictEqual(component.prework.events[0].text, 'prework 1 Due Before third (1/7/2022)');
    assert.strictEqual(component.prework.events[1].text, 'prework 2 Due Before first (1/7/2022)');
  });

  test('prework to unpublished/scheduled/blanked events is not visible', async function (assert) {
    const date = moment(new Date('2015-09-30T12:00:00'));
    const publishedPrework = {
      name: 'published prework',
      startDate: moment().format(),
      endDate: moment().format(),
      ilmSession: true,
      slug: 'whatever',
      postrequisiteSlug: 'something',
      postrequisiteName: 'third',
      isPublished: true,
      isScheduled: false,
      isBlanked: false,
    };
    const unpublishedEvent = createUserEventObject();
    unpublishedEvent.isPublished = false;
    unpublishedEvent.isScheduled = false;
    unpublishedEvent.isBlanked = false;

    const scheduledEvent = createUserEventObject();
    scheduledEvent.isPublished = true;
    scheduledEvent.isScheduled = true;
    scheduledEvent.isBlanked = false;

    const blankedEvent = createUserEventObject();
    blankedEvent.isPublished = true;
    blankedEvent.isScheduled = false;
    blankedEvent.isBlanked = true;

    const events = [unpublishedEvent, scheduledEvent, blankedEvent];

    events.forEach((event) => {
      event.startDate = date.clone();
      event.endDate = date.clone().add(1, 'hour');
      event.prerequisites = [publishedPrework];
    });

    this.set('date', date.toDate());
    this.set('events', events);
    await render(hbs`<IliosCalendarMonth
      @date={{this.date}}
      @calendarEvents={{this.events}}
      @selectEvent={{(noop)}}
    />`);
    assert.strictEqual(component.prework.events.length, 0);
  });

  const createUserEventObject = function () {
    return {
      user: 1,
      name: '',
      offering: 1,
      startDate: null,
      endDate: null,
      calendarColor: '#32edfc',
      location: 'Rm. 160',
      lastModified: new Date(),
      isPublished: true,
      isScheduled: false,
      prerequisites: [],
      postrequisites: [],
    };
  };

  test('multiday events', async function (assert) {
    const date = moment(new Date('2015-09-20T12:00:00'));
    const event = createUserEventObject();
    event.startDate = date.clone();
    event.endDate = date.clone().add(24, 'hour');
    const event2 = createUserEventObject();
    event2.startDate = date.clone().add(48, 'hour');
    event2.endDate = date.clone().add(72, 'hour');
    this.set('date', date.toDate());
    this.set('events', [event, event2]);
    await render(hbs`<IliosCalendarMonth
      @date={{this.date}}
      @calendarEvents={{this.events}}
      @selectEvent={{(noop)}}
    />`);
    assert.strictEqual(component.multiday.events.length, 2);
    assert.strictEqual(
      component.multiday.events[0].text,
      '9/20/15, 12:00 PM – 9/21/15, 12:00 PM Rm. 160'
    );
    assert.strictEqual(
      component.multiday.events[1].text,
      '9/22/15, 12:00 PM – 9/23/15, 12:00 PM Rm. 160'
    );
  });
});
