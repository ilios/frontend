import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';

module('Integration | Component | ilios calendar month', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.actions = {};
    this.send = (actionName, ...args) => this.actions[actionName].apply(this, args);
  });

  test('month displays with three events', async function(assert) {
    assert.expect(4);
    let date = moment(new Date('2015-09-30T12:00:00'));

    this.set('date', date.toDate());

    let firstEvent = createUserEventObject();
    firstEvent.name = 'Some new thing';
    firstEvent.startDate = date.clone();
    firstEvent.endDate = date.clone().add(1, 'hour');

    let secondEvent = createUserEventObject();
    secondEvent.name = 'Second new thing';
    secondEvent.startDate = date.clone().add(1, 'hour');
    secondEvent.endDate = date.clone().add(3, 'hour');

    let thirdEvent = createUserEventObject();
    thirdEvent.name = 'Third new thing';
    thirdEvent.startDate = date.clone().add(3, 'hour');
    thirdEvent.endDate = date.clone().add(4, 'hour');

    this.set('events', [firstEvent, secondEvent, thirdEvent]);
    this.set('nothing', parseInt);
    const events = '.event';
    const more = '.month-more-events';

    await render(hbs`{{ilios-calendar-month
      date=date
      calendarEvents=events
      selectEvent=(action nothing)
      showMore='Show More'}}`);
    //Date input is Wednesday, Septrmber 30th.  Should be the first string
    assert.equal(this.element.textContent.trim().search(/^September 2015/), 0);
    assert.equal(this.element.querySelectorAll(events).length, 2);
    assert.equal(this.element.querySelectorAll(more).length, 1);
    assert.dom(this.element.querySelector(more)).hasText('Show More');
  });

  test('month displays with two events', async function(assert) {
    assert.expect(3);
    let date = moment(new Date('2015-09-30T12:00:00'));

    this.set('date', date.toDate());
    this.set('nothing', parseInt);

    let firstEvent = createUserEventObject();
    firstEvent.name = 'Some new thing';
    firstEvent.startDate = date.clone();
    firstEvent.endDate = date.clone().add(1, 'hour');

    let secondEvent = createUserEventObject();
    secondEvent.name = 'Second new thing';
    secondEvent.startDate = date.clone().add(1, 'hour');
    secondEvent.endDate = date.clone().add(3, 'hour');

    this.set('events', [firstEvent, secondEvent]);
    const events = '.event';
    const more = '.month-more-events';

    await render(hbs`{{ilios-calendar-month
      date=date
      calendarEvents=events
      selectEvent=(action nothing)
      showMore='Show More'}}`);
    //Date input is Wednesday, Septrmber 30th.  Should be the first string
    assert.equal(this.element.textContent.trim().search(/^September 2015/), 0);
    assert.equal(this.element.querySelectorAll(events).length, 2);
    assert.equal(this.element.querySelectorAll(more).length, 0);
  });

  test('clicking on a day fires the correct event', async function(assert) {
    assert.expect(3);
    let date = new Date('2015-09-30T12:00:00');
    this.set('date', date);

    this.actions.changeDate = newDate => {
      assert.ok(newDate instanceof Date);
      assert.ok(newDate.toString().search(/Sun Aug 30/) === 0);
    };
    this.actions.changeView = newView => {
      assert.equal(newView, 'day');
    };

    await render(hbs`{{ilios-calendar-month
      date=date
      changeDate=(action 'changeDate')
      changeView=(action 'changeView')
      calendarEvents=events
    }}`);

    click('.day:nth-of-type(1) .clickable');
  });

  let createUserEventObject = function(){
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
      isScheduled: false
    };
  };
});
