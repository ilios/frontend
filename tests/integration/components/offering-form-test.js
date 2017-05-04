import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { padStart } from 'ember-pad/utils/pad';
import wait from 'ember-test-helpers/wait';
import moment from 'moment';
import { openDatepicker } from 'ember-pikaday/helpers/pikaday';

const { RSVP, Object:EmberObject } = Ember;
const { resolve } = RSVP;

const nothing = ()=>{};

moduleForComponent('offering-form', 'Integration | Component | offering form', {
  integration: true,
  beforeEach(){
    let modalDialogService = this.container.lookup('service:modal-dialog');
    modalDialogService.destinationElementId = 'ember-testing';
  }
});

test('room input does not show by default', function(assert) {
  this.set('nothing', nothing);
  this.render(hbs`{{offering-form close=(action nothing)}}`);

  assert.equal(this.$('.room').length, 0);
});

test('room input shows up when requested', function(assert) {
  this.set('nothing', nothing);
  this.render(hbs`{{offering-form close=(action nothing) showRoom=true}}`);

  assert.equal(this.$('.room').length, 1);
});

test('room validation errors do not show up initially', function(assert) {
  this.set('nothing', nothing);
  this.render(hbs`{{offering-form close=(action nothing) showRoom=true}}`);

  const item = '.room';
  const error = `${item} .validation-error-message`;

  return wait().then(()=>{
    assert.equal(this.$(error).length, 0);
  });
});

test('room validation errors show up when typing', function(assert) {
  this.set('nothing', nothing);
  this.render(hbs`{{offering-form close=(action nothing) showRoom=true}}`);

  const item = '.room';
  const input = `${item} input`;
  const error = `${item} .validation-error-message`;
  const save = '.buttons .done';
  this.$(input).val(padStart('a', 300, 'a'));
  this.$(input).trigger('change');

  this.$(save).click();

  return wait().then(()=>{
    assert.equal(this.$(error).length, 1);
  });
});

test('recurring options does not show by default', function(assert) {
  this.set('nothing', nothing);
  this.render(hbs`{{offering-form close=(action nothing)}}`);

  assert.equal(this.$('.make-recurring').length, 0);
});

test('recurring options shows up when requested', function(assert) {
  this.set('nothing', nothing);
  this.render(hbs`{{offering-form close=(action nothing) showMakeRecurring=true}}`);

  assert.equal(this.$('.make-recurring').length, 1);
});

test('recurring options has all the days of the week', function(assert) {
  this.set('nothing', nothing);
  this.render(hbs`{{offering-form close=(action nothing) showMakeRecurring=true}}`);

  const sunday = '.make-recurring-days label:eq(0)';
  const monday = '.make-recurring-days label:eq(1)';
  const tuesday = '.make-recurring-days label:eq(2)';
  const wednesday = '.make-recurring-days label:eq(3)';
  const thursday = '.make-recurring-days label:eq(4)';
  const friday = '.make-recurring-days label:eq(5)';
  const saturday = '.make-recurring-days label:eq(6)';
  const toggle = '.make-recurring .toggle-onoff';

  this.$(toggle).click();
  assert.equal(this.$(sunday).text().trim(), 'Sunday');
  assert.equal(this.$(monday).text().trim(), 'Monday');
  assert.equal(this.$(tuesday).text().trim(), 'Tuesday');
  assert.equal(this.$(wednesday).text().trim(), 'Wednesday');
  assert.equal(this.$(thursday).text().trim(), 'Thursday');
  assert.equal(this.$(friday).text().trim(), 'Friday');
  assert.equal(this.$(saturday).text().trim(), 'Saturday');

});

test('recurring numberOfWeeks validation errors do not show up initially', function(assert) {
  this.set('nothing', nothing);
  this.render(hbs`{{offering-form close=(action nothing) showMakeRecurring=true}}`);

  const item = '.make-recurring-input-container';
  const error = `${item} .validation-error-message`;
  const toggle = '.make-recurring .toggle-onoff';

  this.$(toggle).click();

  return wait().then(()=>{
    assert.equal(this.$(error).length, 0);
  });
});

test('recurring numberOfWeeks validation errors show up when saving', function(assert) {
  this.set('nothing', nothing);
  this.render(hbs`{{offering-form close=(action nothing) showMakeRecurring=true}}`);

  const item = '.make-recurring-input-container';
  const error = `${item} .validation-error-message`;
  const input = `${item} input`;
  const toggle = '.make-recurring .toggle-onoff';

  this.$(toggle).click();
  const save = '.buttons .done';
  this.$(input).val(0).trigger('change');

  this.$(save).click();

  return wait().then(()=>{
    assert.equal(this.$(error).length, 1);
  });
});

test('recurring default day is disabled and checked', function(assert) {
  this.set('nothing', nothing);
  this.render(hbs`{{offering-form close=(action nothing) showMakeRecurring=true}}`);

  const inputs = '.make-recurring-days input';
  const dayToday = moment().day();
  const toggle = '.make-recurring .toggle-onoff';

  this.$(toggle).click();
  let checkbox = this.$(inputs).eq(dayToday);
  assert.ok(checkbox.is(':checked'));
  assert.ok(checkbox.is(':disabled'));
});

test('instructor manager does not show by default', function(assert) {
  this.set('nothing', nothing);
  this.render(hbs`{{offering-form close=(action nothing)}}`);

  assert.equal(this.$('.instructors').length, 0);
});

test('instructor manager shows up when requested', function(assert) {
  this.set('nothing', nothing);
  this.render(hbs`{{offering-form close=(action nothing) showInstructors=true}}`);

  assert.equal(this.$('.instructors').length, 1);
});

test('before course startDate default initial startDate falls on course start date', function(assert) {
  this.set('nothing', nothing);
  let courseStartDate = moment().add(2, 'days');
  let courseEndDate = moment().add(4, 'days');
  this.set('courseStartDate', courseStartDate);
  this.set('courseEndDate', courseEndDate);
  this.set('nothing', nothing);

  this.render(hbs`{{offering-form close=(action nothing) courseStartDate=courseStartDate courseEndDate=courseEndDate}}`);

  const startDate = '.start-date input';
  let interactor = openDatepicker(this.$(startDate));
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

test('after course endDate default initial startDate falls on course end date', function(assert) {
  this.set('nothing', nothing);
  let courseStartDate = moment().subtract(4, 'days');
  let courseEndDate = moment().subtract(2, 'days');
  this.set('courseStartDate', courseStartDate);
  this.set('courseEndDate', courseEndDate);
  this.set('nothing', nothing);

  this.render(hbs`{{offering-form close=(action nothing) courseStartDate=courseStartDate courseEndDate=courseEndDate}}`);

  const startDate = '.start-date input';
  let interactor = openDatepicker(this.$(startDate));
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

test('between course startDate and endDate default initial startDate falls on today', function(assert) {
  this.set('nothing', nothing);
  let courseStartDate = moment().subtract(4, 'days');
  let courseEndDate = moment().add(4, 'days');
  let today = moment();
  this.set('courseStartDate', courseStartDate);
  this.set('courseEndDate', courseEndDate);
  this.set('nothing', nothing);

  this.render(hbs`{{offering-form close=(action nothing) courseStartDate=courseStartDate courseEndDate=courseEndDate}}`);

  const startDate = '.start-date input';
  let interactor = openDatepicker(this.$(startDate));
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

test('close sends close', function(assert) {
  assert.expect(1);
  this.set('close', ()=>{
    assert.ok(true);
  });
  const closeButton = '.buttons .cancel';
  this.render(hbs`{{offering-form close=(action close)}}`);
  this.$(closeButton).click();
});

test('save not recurring', function(assert) {
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
  this.render(hbs`{{offering-form close=(action nothing) save=(action save)}}`);

  this.$(save).click();

  return wait();
});

test('save recurring one week with days selected before initial date', function(assert) {
  assert.expect(2);
  this.set('nothing', nothing);

  const inputs = '.make-recurring-days input';
  const wednesday = moment().add(1, 'week').day(3);
  const thursday = wednesday.clone().add(1, 'day').day();
  const tuesday = wednesday.clone().subtract(1, 'day').day();
  const toggle = '.make-recurring .toggle-onoff';
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
  this.render(hbs`{{offering-form close=(action nothing) showMakeRecurring=true save=(action save)}}`);

  this.$(toggle).click();
  let interactor = openDatepicker(this.$(startDateInput));
  interactor.selectDate(newStartDate);

  this.$(inputs).eq(thursday).click().change();
  this.$(inputs).eq(tuesday).click().change();

  this.$(save).click();

  return wait();
});

test('save recurring 3 weeks should get lots of days', function(assert) {
  assert.expect(8);
  this.set('nothing', nothing);

  const inputs = '.make-recurring-days input';
  const wednesday = moment().add(1, 'week').day(3);
  const thursday = wednesday.clone().add(1, 'day').day();
  const tuesday = wednesday.clone().subtract(1, 'day').day();
  const weeks = '.make-recurring-input-container input';
  const toggle = '.make-recurring .toggle-onoff';
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
  this.render(hbs`{{offering-form close=(action nothing) showMakeRecurring=true save=(action save)}}`);

  this.$(toggle).click();
  this.$(weeks).val(3).trigger('change');
  let interactor = openDatepicker(this.$(startDateInput));
  interactor.selectDate(newStartDate);
  this.$(inputs).eq(thursday).click().change();
  this.$(inputs).eq(tuesday).click().change();

  this.$(save).click();

  return wait();
});

test('changing start date changes end date', function(assert) {
  this.set('nothing', nothing);
  this.render(hbs`{{offering-form close=(action nothing)}}`);

  const startDate = '.start-date input';
  const endDate = '.end-date-time .text';
  const format = 'M/D/YYYY h:mm a';
  const newStartDate = moment().add(1, 'day').toDate();
  let interactor = openDatepicker(this.$(startDate));
  assert.equal(moment().hour(9).minute(0).format(format), this.$(endDate).text().trim());
  interactor.selectDate(newStartDate);
  assert.equal(moment(newStartDate).hour(9).minute(0).format(format), this.$(endDate).text().trim());

});

test('changing start time changes end date', function(assert) {
  this.set('nothing', nothing);
  this.render(hbs`{{offering-form close=(action nothing)}}`);

  const startHour = '.start-time select:eq(0)';
  const startMinute = '.start-time select:eq(1)';
  const startAmPm = '.start-time select:eq(2)';
  const endDate = '.end-date-time .text';
  const format = 'M/D/YYYY h:mm a';
  assert.equal(moment().hour(9).minute(0).format(format), this.$(endDate).text().trim());
  this.$(startHour).val('2').change();
  this.$(startMinute).val('15').change();
  this.$(startAmPm).val('pm').change();

  assert.equal(moment().hour(15).minute(15).format(format), this.$(endDate).text().trim());

});

test('changing duration changes end date', function(assert) {
  this.set('nothing', nothing);
  this.render(hbs`{{offering-form close=(action nothing)}}`);

  const durationHour = '.offering-duration .hours input';
  const durationMinute = '.offering-duration .minutes input';
  const endDate = '.end-date-time .text';
  const format = 'M/D/YYYY h:mm a';
  assert.equal(moment().hour(9).minute(0).format(format), this.$(endDate).text().trim());
  this.$(durationHour).val('2').change();
  return wait().then(()=>{
    this.$(durationMinute).val('15').change();
    return wait().then(()=>{
      assert.equal(moment().hour(10).minute(15).format(format), this.$(endDate).text().trim());
    });
  });
});

// @see https://github.com/ilios/frontend/issues/1903
test('changing duration and start time changes end date', function(assert) {
  this.set('nothing', nothing);
  this.render(hbs`{{offering-form close=(action nothing)}}`);

  const startHour = '.start-time select:eq(0)';
  const startMinute = '.start-time select:eq(1)';
  const startAmPm = '.start-time select:eq(2)';
  const durationHour = '.offering-duration .hours input';
  const durationMinute = '.offering-duration .minutes input';
  const endDate = '.end-date-time .text';
  const format = 'M/D/YYYY h:mm a';
  assert.equal(moment().hour(9).minute(0).format(format), this.$(endDate).text().trim());
  this.$(startHour).val('2').change();
  this.$(startMinute).val('10').change();
  this.$(startAmPm).val('pm').change();
  this.$(durationHour).val('2').change();
  return wait().then(()=>{
    this.$(durationMinute).val('50').change();
    return wait().then(()=>{
      assert.equal(moment().hour(17).minute(0).format(format), this.$(endDate).text().trim());
    });
  });
});

test('learnerGroup validation errors do not show up initially', function(assert) {
  this.set('nothing', nothing);
  this.render(hbs`{{offering-form close=(action nothing) smallGroupMode=true}}`);

  const item = '.learner-groups';
  const error = `${item} .validation-error-message`;

  return wait().then(()=>{
    assert.equal(this.$(error).length, 0);
  });
});

test('learnerGroup validation errors show up when saving', function(assert) {
  this.set('nothing', nothing);
  this.render(hbs`{{offering-form close=(action nothing) smallGroupMode=true}}`);

  const item = '.learner-groups';
  const error = `${item} .validation-error-message`;
  const save = '.buttons .done';

  this.$(save).click();

  return wait().then(()=>{
    assert.equal(this.$(error).length, 1);
  });
});

test('renders when an offering is provided', function(assert) {
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
  this.render(hbs`{{offering-form offering=offering close=(action nothing) showRoom=true showMakeRecurring=true showInstructors=true}}`);
  const startDate = '.start-date input';
  const room = '.room input';
  const durationHours = '.offering-duration .hours input';
  const durationMinutes = '.offering-duration .minutes input';

  assert.equal(this.$(room).val(), 'emerald bay');
  assert.equal(this.$(durationHours).val(), '1');
  assert.equal(this.$(durationMinutes).val(), '0');

  let interactor = openDatepicker(this.$(startDate));
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
