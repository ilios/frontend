import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  settled,
  click,
  find,
  findAll,
  fillIn
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { padStart } from 'ember-pad/utils/pad';
import moment from 'moment';
import { openDatepicker } from 'ember-pikaday/helpers/pikaday';

const { resolve } = RSVP;

const nothing = ()=>{};

module('Integration | Component | offering form', function(hooks) {
  setupRenderingTest(hooks);

  test('room input does not show by default', async function(assert) {
    this.set('nothing', nothing);
    await render(hbs`{{offering-form close=(action nothing)}}`);

    assert.dom('.room').doesNotExist();
  });

  test('room input shows up when requested', async function(assert) {
    this.set('nothing', nothing);
    await render(hbs`{{offering-form close=(action nothing) showRoom=true}}`);

    assert.dom('.room').exists({ count: 1 });
  });

  test('room validation errors do not show up initially', async function(assert) {
    this.set('nothing', nothing);
    await render(hbs`{{offering-form close=(action nothing) showRoom=true}}`);

    const item = '.room';
    const error = `${item} .validation-error-message`;
    assert.dom(error).doesNotExist();
  });

  test('room validation errors show up when typing', async function(assert) {
    this.set('nothing', nothing);
    await render(hbs`{{offering-form close=(action nothing) showRoom=true}}`);

    const item = '.room';
    const input = `${item} input`;
    const error = `${item} .validation-error-message`;
    const save = '.buttons .done';
    await fillIn(input, padStart('a', 300, 'a'));
    await click(save);
    assert.dom(error).exists({ count: 1 });
  });

  test('recurring options does not show by default', async function(assert) {
    this.set('nothing', nothing);
    await render(hbs`{{offering-form close=(action nothing)}}`);

    assert.dom('.make-recurring').doesNotExist();
  });

  test('recurring options shows up when requested', async function(assert) {
    this.set('nothing', nothing);
    await render(hbs`{{offering-form close=(action nothing) showMakeRecurring=true}}`);

    assert.dom('.make-recurring').exists({ count: 1 });
  });

  test('recurring options has all the days of the week', async function(assert) {
    this.set('nothing', nothing);
    await render(hbs`{{offering-form close=(action nothing) showMakeRecurring=true}}`);

    const sunday = '[data-test-recurring-day-label="0"]';
    const monday = '[data-test-recurring-day-label="1"]';
    const tuesday = '[data-test-recurring-day-label="2"]';
    const wednesday = '[data-test-recurring-day-label="3"]';
    const thursday = '[data-test-recurring-day-label="4"]';
    const friday = '[data-test-recurring-day-label="5"]';
    const saturday = '[data-test-recurring-day-label="6"]';
    const toggle = '.make-recurring .toggle-yesno';

    await click(toggle);
    assert.dom(sunday).hasText('Sunday');
    assert.dom(monday).hasText('Monday');
    assert.dom(tuesday).hasText('Tuesday');
    assert.dom(wednesday).hasText('Wednesday');
    assert.dom(thursday).hasText('Thursday');
    assert.dom(friday).hasText('Friday');
    assert.dom(saturday).hasText('Saturday');

  });

  test('recurring numberOfWeeks validation errors do not show up initially', async function(assert) {
    this.set('nothing', nothing);
    await render(hbs`{{offering-form close=(action nothing) showMakeRecurring=true}}`);

    const item = '.make-recurring-input-container';
    const error = `${item} .validation-error-message`;
    const toggle = '.make-recurring .toggle-yesno';

    await click(toggle);
    assert.dom(error).doesNotExist();
  });

  test('recurring numberOfWeeks validation errors show up when saving', async function(assert) {
    this.set('nothing', nothing);
    await render(hbs`{{offering-form close=(action nothing) showMakeRecurring=true}}`);

    const item = '.make-recurring-input-container';
    const error = `${item} .validation-error-message`;
    const input = `${item} input`;
    const toggle = '.make-recurring .toggle-yesno';

    await click(toggle);
    const save = '.buttons .done';
    await fillIn(input, 0);
    await click(save);
    assert.dom(error).exists({ count: 1 });
  });

  test('recurring default day is disabled and checked', async function(assert) {
    this.set('nothing', nothing);
    await render(hbs`{{offering-form close=(action nothing) showMakeRecurring=true}}`);

    const inputs = '.make-recurring-days input';
    const dayToday = moment().day();
    const toggle = '.make-recurring .toggle-yesno';

    await click(toggle);
    let checkbox = findAll(inputs)[dayToday];
    assert.ok(checkbox.checked);
    assert.ok(checkbox.disabled);
  });

  test('instructor manager does not show by default', async function(assert) {
    this.set('nothing', nothing);
    await render(hbs`{{offering-form close=(action nothing)}}`);

    assert.dom('.instructors').doesNotExist();
  });

  test('instructor manager shows up when requested', async function(assert) {
    this.set('nothing', nothing);
    await render(hbs`{{offering-form close=(action nothing) showInstructors=true}}`);

    assert.dom('.instructors').exists({ count: 1 });
  });

  test('before course startDate default initial startDate falls on course start date', async function(assert) {
    this.set('nothing', nothing);
    let courseStartDate = moment().add(2, 'days');
    let courseEndDate = moment().add(4, 'days');
    this.set('courseStartDate', courseStartDate);
    this.set('courseEndDate', courseEndDate);
    this.set('nothing', nothing);

    await render(
      hbs`{{offering-form close=(action nothing) courseStartDate=courseStartDate courseEndDate=courseEndDate}}`
    );

    const startDate = '.start-date input';
    let interactor = openDatepicker(find(startDate));
    assert.equal(
      interactor.selectedYear(),
      courseStartDate.year(),
      'Selected year initialized to course start date year.'
    );
    assert.equal(
      interactor.selectedMonth(),
      courseStartDate.month(),
      'Selected month initialized to course start date month.'
    );
    assert.equal(
      interactor.selectedDay(),
      courseStartDate.date(),
      'Selected day initialized to course start date day.'
    );

  });

  test('after course endDate default initial startDate falls on course end date', async function(assert) {
    this.set('nothing', nothing);
    let courseStartDate = moment().subtract(4, 'days');
    let courseEndDate = moment().subtract(2, 'days');
    this.set('courseStartDate', courseStartDate);
    this.set('courseEndDate', courseEndDate);
    this.set('nothing', nothing);

    await render(
      hbs`{{offering-form close=(action nothing) courseStartDate=courseStartDate courseEndDate=courseEndDate}}`
    );

    const startDate = '.start-date input';
    let interactor = openDatepicker(find(startDate));
    assert.equal(
      interactor.selectedYear(),
      courseEndDate.year(),
      'Selected year initialized to course start date year.'
    );
    assert.equal(
      interactor.selectedMonth(),
      courseEndDate.month(),
      'Selected month initialized to course start date month.'
    );
    assert.equal(
      interactor.selectedDay(),
      courseEndDate.date(),
      'Selected day initialized to course start date day.'
    );

  });

  test('between course startDate and endDate default initial startDate falls on today', async function(assert) {
    this.set('nothing', nothing);
    let courseStartDate = moment().subtract(4, 'days');
    let courseEndDate = moment().add(4, 'days');
    let today = moment();
    this.set('courseStartDate', courseStartDate);
    this.set('courseEndDate', courseEndDate);
    this.set('nothing', nothing);

    await render(
      hbs`{{offering-form close=(action nothing) courseStartDate=courseStartDate courseEndDate=courseEndDate}}`
    );

    const startDate = '.start-date input';
    let interactor = openDatepicker(find(startDate));
    assert.equal(
      interactor.selectedYear(),
      today.year(),
      'Selected year initialized to course start date year.'
    );
    assert.equal(
      interactor.selectedMonth(),
      today.month(),
      'Selected month initialized to course start date month.'
    );
    assert.equal(
      interactor.selectedDay(),
      today.date(),
      'Selected day initialized to course start date day.'
    );
  });

  test('close sends close', async function(assert) {
    assert.expect(1);
    this.set('close', ()=>{
      assert.ok(true);
    });
    const closeButton = '.buttons .cancel';
    await render(hbs`{{offering-form close=(action close)}}`);
    await click(closeButton);
  });

  test('save not recurring', async function(assert) {
    assert.expect(6);
    this.set('nothing', nothing);
    this.set('save', (startDate, endDate, room, learnerGroups, instructorGroups, instructors)=>{
      assert.equal(moment(startDate).format('YYYY-MM-DD'), moment().format('YYYY-MM-DD'));
      assert.equal(moment(endDate).format('YYYY-MM-DD'), moment().format('YYYY-MM-DD'));
      assert.equal(room, 'TBD');
      assert.equal(learnerGroups.length, 0);
      assert.equal(instructorGroups.length, 0);
      assert.equal(instructors.length, 0);
    });
    const save = '.buttons .done';
    await render(hbs`{{offering-form close=(action nothing) save=(action save)}}`);

    await click(save);

    return settled();
  });

  test('save recurring one week with days selected before initial date', async function(assert) {
    assert.expect(2);
    this.set('nothing', nothing);

    const wednesday = moment().add(1, 'week').day(3);
    const thursday = wednesday.clone().add(1, 'day').day();
    const tuesday = wednesday.clone().subtract(1, 'day').day();
    const toggle = '.make-recurring .toggle-yesno';
    const startDateInput = '.start-date input';
    const newStartDate = wednesday.toDate();

    let savedCount = 0;
    this.set('save', (startDate)=>{
      let expectedStartDate;
      if (savedCount === 0) {
        expectedStartDate = wednesday.clone();
      } else if (savedCount === 1) {
        expectedStartDate = wednesday.clone().day(thursday);
      } else {
        assert.ok(false, 'should only get two saved offerings, we got ' + (savedCount + 1));
      }
      if (expectedStartDate) {
        assert.equal(moment(startDate).format('YYYY-MM-DD'), expectedStartDate.format('YYYY-MM-DD'));
      }

      savedCount++;

      return resolve();
    });

    const save = '.buttons .done';
    await render(hbs`{{offering-form close=(action nothing) showMakeRecurring=true save=(action save)}}`);

    await click(toggle);
    let interactor = openDatepicker(find(startDateInput));
    interactor.selectDate(newStartDate);

    await click(`[data-test-recurring-day-input="${thursday}"]`);
    await click(`[data-test-recurring-day-input="${tuesday}"]`);
    await click(save);
  });

  test('save recurring 3 weeks should get lots of days', async function(assert) {
    assert.expect(8);
    this.set('nothing', nothing);

    const wednesday = moment().add(1, 'week').day(3);
    const thursday = wednesday.clone().add(1, 'day').day();
    const tuesday = wednesday.clone().subtract(1, 'day').day();
    const weeks = '.make-recurring-input-container input';
    const toggle = '.make-recurring .toggle-yesno';
    const startDateInput = '.start-date input';
    const newStartDate = wednesday.toDate();

    let savedCount = 0;
    this.set('save', (startDate)=>{
      let expectedStartDate;
      if (savedCount === 0) {
        expectedStartDate = wednesday.clone();
      } else if (savedCount === 1) {
        expectedStartDate = wednesday.clone().add(1, 'day');
      } else if (savedCount === 2) {
        expectedStartDate = wednesday.clone().subtract(1, 'day').add(1, 'weeks');
      } else if (savedCount === 3) {
        expectedStartDate = wednesday.clone().add(1, 'weeks');
      } else if (savedCount === 4) {
        expectedStartDate = wednesday.clone().add(1, 'day').add(1, 'weeks');
      } else if (savedCount === 5) {
        expectedStartDate = wednesday.clone().subtract(1, 'day').add(2, 'weeks');
      } else if (savedCount === 6) {
        expectedStartDate = wednesday.clone().add(2, 'weeks');
      } else if (savedCount === 7) {
        expectedStartDate = wednesday.clone().add(1, 'day').add(2, 'weeks');
      } else {
        assert.ok(false, 'should only get eight saved offerings, we got ' + (savedCount + 1) + ' with startDate ' + moment(startDate).format('YYYY-MM-DD'));
      }
      if (expectedStartDate) {
        assert.equal(expectedStartDate.format('YYYY-MM-DD'), moment(startDate).format('YYYY-MM-DD'));
      }

      savedCount++;

      return resolve();
    });

    const save = '.buttons .done';
    await render(hbs`{{offering-form close=(action nothing) showMakeRecurring=true save=(action save)}}`);

    await click(toggle);
    await fillIn(weeks, 3);
    let interactor = openDatepicker(find(startDateInput));
    interactor.selectDate(newStartDate);
    await click(`[data-test-recurring-day-input="${thursday}"]`);
    await click(`[data-test-recurring-day-input="${tuesday}"]`);

    await click(save);
  });

  test('changing start date changes end date', async function(assert) {
    this.set('nothing', nothing);
    await render(hbs`{{offering-form close=(action nothing)}}`);

    const startDate = '.start-date input';
    const endDate = '.end-date-time .text';
    const format = 'M/D/YYYY h:mm a';
    const newStartDate = moment().add(1, 'day').toDate();
    let interactor = openDatepicker(find(startDate));
    assert.equal(moment().hour(9).minute(0).format(format), find(endDate).textContent.trim());
    interactor.selectDate(newStartDate);
    await settled();
    assert.equal(moment(newStartDate).hour(9).minute(0).format(format), find(endDate).textContent.trim());

  });

  test('changing start time changes end date', async function(assert) {
    this.set('nothing', nothing);
    await render(hbs`{{offering-form close=(action nothing)}}`);

    const startHour = '.start-time select:nth-of-type(1)';
    const startMinute = '.start-time select:nth-of-type(2)';
    const startAmPm = '.start-time select:nth-of-type(3)';
    const endDate = '.end-date-time .text';
    const format = 'M/D/YYYY h:mm a';
    assert.equal(moment().hour(9).minute(0).format(format), find(endDate).textContent.trim());
    await fillIn(startHour, '2');
    await fillIn(startMinute, '15');
    await fillIn(startAmPm, 'pm');

    assert.equal(moment().hour(15).minute(15).format(format), find(endDate).textContent.trim());

  });

  test('changing duration changes end date', async function(assert) {
    this.set('nothing', nothing);
    await render(hbs`{{offering-form close=(action nothing)}}`);

    const durationHour = '.offering-duration .hours input';
    const durationMinute = '.offering-duration .minutes input';
    const endDate = '.end-date-time .text';
    const format = 'M/D/YYYY h:mm a';
    assert.equal(moment().hour(9).minute(0).format(format), find(endDate).textContent.trim());
    await fillIn(durationHour, '2');
    await fillIn(durationMinute, '15');
    assert.equal(moment().hour(10).minute(15).format(format), find(endDate).textContent.trim());
  });

  // @see https://github.com/ilios/frontend/issues/1903
  test('changing duration and start time changes end date', async function(assert) {
    this.set('nothing', nothing);
    await render(hbs`{{offering-form close=(action nothing)}}`);

    const startHour = '.start-time select:nth-of-type(1)';
    const startMinute = '.start-time select:nth-of-type(2)';
    const startAmPm = '.start-time select:nth-of-type(3)';
    const durationHour = '.offering-duration .hours input';
    const durationMinute = '.offering-duration .minutes input';
    const endDate = '.end-date-time .text';
    const format = 'M/D/YYYY h:mm a';
    assert.equal(moment().hour(9).minute(0).format(format), find(endDate).textContent.trim());
    await fillIn(startHour, '2');
    await fillIn(startMinute, '10');
    await fillIn(startAmPm, 'pm');
    await fillIn(durationHour, '2');
    await fillIn(durationMinute, '50');
    assert.equal(moment().hour(17).minute(0).format(format), find(endDate).textContent.trim());
  });

  test('learnerGroup validation errors do not show up initially', async function(assert) {
    this.set('nothing', nothing);
    await render(hbs`{{offering-form close=(action nothing) smallGroupMode=true}}`);

    const item = '.learner-groups';
    const error = `${item} .validation-error-message`;

    return settled().then(()=>{
      assert.dom(error).doesNotExist();
    });
  });

  test('learnerGroup validation errors show up when saving', async function(assert) {
    this.set('nothing', nothing);
    await render(hbs`{{offering-form close=(action nothing) smallGroupMode=true}}`);

    const item = '.learner-groups';
    const error = `${item} .validation-error-message`;
    const save = '.buttons .done';

    await click(save);

    return settled().then(()=>{
      assert.dom(error).exists({ count: 1 });
    });
  });

  test('renders when an offering is provided', async function(assert) {
    let offering = EmberObject.create({
      room: 'emerald bay',
      startDate: moment('2005-06-24').hour(18).minute(24).toDate(),
      endDate: moment('2005-06-24').hour(19).minute(24).toDate(),
      learnerGroups: resolve([]),
      instructors: resolve([]),
      instructorGroups: resolve([]),
    });

    this.set('nothing', nothing);
    this.set('offering', offering);
    await render(
      hbs`{{offering-form offering=offering close=(action nothing) showRoom=true showMakeRecurring=true showInstructors=true}}`
    );
    const startDate = '.start-date input';
    const room = '.room input';
    const durationHours = '.offering-duration .hours input';
    const durationMinutes = '.offering-duration .minutes input';

    assert.dom(room).hasValue('emerald bay');
    assert.dom(durationHours).hasValue('1');
    assert.dom(durationMinutes).hasValue('0');

    let interactor = openDatepicker(find(startDate));
    return settled().then(()=> {
      assert.equal(
        interactor.selectedYear(),
        2005,
        'Selected year initialized to offering start date year.'
      );
      assert.equal(
        interactor.selectedMonth(),
        '5',
        'Selected month initialized to offering start date month.'
      );
      assert.equal(
        interactor.selectedDay(),
        '24',
        'Selected day initialized to offering start date day.'
      );
    });
  });
});
