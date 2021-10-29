import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';

module('Integration | Component | ilios calendar day', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    assert.expect(2);
    const date = new Date('2015-09-30T12:00:00');
    this.set('date', date);
    await render(
      hbs`<IliosCalendarDay @date={{date}} @selectEvent={{(noop)}} @calendarEvents={{(array)}} />`
    );
    //Date input is Wednesday, Septrmber 30th.  Should be the first string
    assert.dom().containsText('Wednesday');
    assert.dom('[data-test-calender-event]').doesNotExist();
  });

  test('prework', async function (assert) {
    assert.expect(3);

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
    await render(hbs`<IliosCalendarDay
      @date={{this.date}}
      @calendarEvents={{this.events}}
      @selectEvent={{(noop)}}
    />`);
    const preworkSelector = '[data-test-ilios-calendar-pre-work-event]';
    const preworkElements = this.element.querySelectorAll(preworkSelector);
    assert.strictEqual(preworkElements.length, 2);
    assert.ok(preworkElements[0].textContent.includes('prework 1'));
    assert.ok(preworkElements[1].textContent.includes('prework 2'));
  });

  test('prework to unpublished/scheduled/blanked events is not visible', async function (assert) {
    assert.expect(1);

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
    await render(hbs`<IliosCalendarDay
      @date={{this.date}}
      @calendarEvents={{this.events}}
      @selectEvent={{(noop)}}
    />`);
    const preworkSelector = '[data-test-ilios-calendar-pre-work-event]';
    const preworkElements = this.element.querySelectorAll(preworkSelector);
    assert.strictEqual(preworkElements.length, 0);
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
});
