import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { component as weeklyCalendarComponent } from 'ilios-common/page-objects/components/weekly-calendar';
import moment from 'moment';

module('Integration | Component | ilios calendar week', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.actions = {};
    this.send = (actionName, ...args) => this.actions[actionName].apply(this, args);
  });

  test('it renders', async function (assert) {
    assert.expect(2);
    const date = new Date('2015-09-30T12:00:00');
    this.set('date', date);

    await render(hbs`<IliosCalendarWeek @date={{this.date}} @calendarEvents={{(array)}} />`);
    assert.dom().containsText('Week of September 27, 2015');
    assert.strictEqual(weeklyCalendarComponent.events.length, 0);
  });

  test('clicking on a day header fires the correct events', async function (assert) {
    assert.expect(3);
    const date = new Date('2015-09-30T12:00:00');
    this.set('date', date);
    this.actions.changeDate = (newDate) => {
      assert.ok(newDate instanceof Date);
      assert.strictEqual(newDate.toString().search(/Sun Sep 27/), 0);
    };
    this.actions.changeView = (newView) => {
      assert.strictEqual(newView, 'day');
    };

    await render(hbs`<IliosCalendarWeek
      @date={{this.date}}
      @calendarEvents={{(array)}}
      @areDaysSelectable={{true}}
      @changeDate={{action "changeDate"}}
      @changeView={{action "changeView"}}
    />`);
    weeklyCalendarComponent.dayHeadings[0].selectDay();
  });

  test('clicking on a day header does nothing when areDaysSelectable is false', async function (assert) {
    assert.expect(0);
    const date = new Date('2015-09-30T12:00:00');
    this.set('date', date);
    this.set('nothing', () => {
      assert.ok(false, 'this should never be called');
    });

    await render(hbs`<IliosCalendarWeek
      @date={{this.date}}
      @calendarEvents={{(array)}}
      @areDaysSelectable={{false}}
      @changeDate={{this.nothing}}
      @changeView={{this.nothing}}
    />`);
    await weeklyCalendarComponent.dayHeadings[0].selectDay();
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
    await render(hbs`<IliosCalendarWeek
      @date={{this.date}}
      @calendarEvents={{this.events}}
      @areDaysSelectable={{false}}
      @changeDate={{(noop)}}
      @changeView={{(noop)}}
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
    await render(hbs`<IliosCalendarWeek
      @date={{this.date}}
      @calendarEvents={{this.events}}
      @areDaysSelectable={{false}}
      @changeDate={{(noop)}}
      @changeView={{(noop)}}
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
      isBlanked: false,
      prerequisites: [],
      postrequisites: [],
    };
  };
});
