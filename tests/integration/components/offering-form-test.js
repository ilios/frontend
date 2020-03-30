import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { padStart } from 'ember-pad/utils/pad';
import moment from 'moment';
import { component } from 'ilios-common/page-objects/components/offering-form';

module('Integration | Component | offering form', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('room input does not show by default', async function(assert) {
    await render(hbs`<OfferingForm @close={{noop}} />`);
    assert.notOk(component.location.isPresent);
  });

  test('room input shows up when requested', async function(assert) {
    await render(hbs`<OfferingForm @close={{noop}} @showRoom={{true}} />`);
    assert.ok(component.location.isPresent);
  });

  test('room validation errors do not show up initially', async function(assert) {
    await render(hbs`<OfferingForm @close={{noop}} @showRoom={{true}} />`);
    assert.notOk(component.location.hasError);
  });

  test('room validation errors show up when typing', async function(assert) {
    await render(hbs`<OfferingForm @close={{noop}} @showRoom={{true}} />`);
    await component.location.set(padStart('a', 300, 'a'));
    await component.save();
    assert.ok(component.location.hasError);
  });

  test('recurring options does not show by default', async function(assert) {
    await render(hbs`<OfferingForm @close={{noop}} />`);
    assert.notOk(component.recurring.isPresent);
  });

  test('recurring options shows up when requested', async function(assert) {
    await render(hbs`<OfferingForm @close={{noop}} @showMakeRecurring={{true}} />`);
    assert.ok(component.recurring.isPresent);
  });

  test('recurring options has all the days of the week', async function(assert) {
    await render(hbs`<OfferingForm @close={{noop}} @showMakeRecurring={{true}} />`);
    await component.recurring.toggle();
    assert.ok(component.recurring.weekdays[0].label, 'Sunday');
    assert.ok(component.recurring.weekdays[1].label, 'Monday');
    assert.ok(component.recurring.weekdays[2].label, 'Tuesday');
    assert.ok(component.recurring.weekdays[3].label, 'Wednesday');
    assert.ok(component.recurring.weekdays[4].label, 'Thursday');
    assert.ok(component.recurring.weekdays[5].label, 'Friday');
    assert.ok(component.recurring.weekdays[6].label, 'Saturday');
  });

  test('recurring numberOfWeeks validation errors do not show up initially', async function(assert) {
    await render(hbs`<OfferingForm @close={{noop}} @showMakeRecurring={{true}} />`);
    await component.recurring.toggle();
    assert.notOk(component.recurring.hasError);
  });

  test('recurring numberOfWeeks validation errors show up when saving', async function(assert) {
    await render(hbs`<OfferingForm @close={{noop}} @showMakeRecurring={{true}} />`);
    await component.recurring.toggle();
    await component.recurring.setWeeks("0");
    await component.save();
    assert.ok(component.recurring.hasError);
  });

  test('recurring default day is disabled and checked', async function(assert) {
    await render(hbs`<OfferingForm @close={{noop}} @showMakeRecurring={{true}} />`);
    const dayToday = moment().day();
    await component.recurring.toggle();
    assert.ok(component.recurring.weekdays[dayToday].input.isSelected);
    assert.ok(component.recurring.weekdays[dayToday].input.isDisabled);
  });

  test('instructor manager does not show by default', async function(assert) {
    await render(hbs`<OfferingForm @close={{noop}} />`);
    assert.notOk(component.instructors.isPresent);
  });

  test('instructor manager shows up when requested', async function(assert) {
    await render(hbs`<OfferingForm @close={{noop}} @showInstructors={{true}} />`);
    assert.ok(component.instructors.isPresent);
  });

  test('before course startDate default initial startDate falls on course start date', async function(assert) {
    const courseStartDate = moment().add(2, 'days');
    const courseEndDate = moment().add(4, 'days');
    this.set('courseStartDate', courseStartDate);
    this.set('courseEndDate', courseEndDate);
    await render(hbs`<OfferingForm
      @close={{noop}}
      @courseStartDate={{this.courseStartDate}}
      @courseEndDate={{this.courseEndDate}}
    />`);
    const selectedDate = new Date(component.startDate.value);
    assert.equal(
      selectedDate.getFullYear(),
      courseStartDate.year(),
      'Selected year initialized to course start date year.'
    );
    assert.equal(
      selectedDate.getMonth(),
      courseStartDate.month(),
      'Selected month initialized to course start date month.'
    );
    assert.equal(
      selectedDate.getDate(),
      courseStartDate.date(),
      'Selected day initialized to course start date day.'
    );
  });

  test('after course endDate default initial startDate falls on course end date', async function(assert) {
    const courseStartDate = moment().subtract(4, 'days');
    const courseEndDate = moment().subtract(2, 'days');
    this.set('courseStartDate', courseStartDate);
    this.set('courseEndDate', courseEndDate);
    await render(hbs`<OfferingForm
      @close={{noop}}
      @courseStartDate={{this.courseStartDate}}
      @courseEndDate={{this.courseEndDate}}
    />`);
    const selectedDate = new Date(component.startDate.value);
    assert.equal(
      selectedDate.getFullYear(),
      courseEndDate.year(),
      'Selected year initialized to course start date year.'
    );
    assert.equal(
      selectedDate.getMonth(),
      courseEndDate.month(),
      'Selected month initialized to course start date month.'
    );
    assert.equal(
      selectedDate.getDate(),
      courseEndDate.date(),
      'Selected day initialized to course start date day.'
    );
  });

  test('between course startDate and endDate default initial startDate falls on today', async function(assert) {
    const courseStartDate = moment().subtract(4, 'days');
    const courseEndDate = moment().add(4, 'days');
    const today = moment();
    this.set('courseStartDate', courseStartDate);
    this.set('courseEndDate', courseEndDate);
    await render(hbs`<OfferingForm
      @close={{noop}}
      @courseStartDate={{this.courseStartDate}}
      @courseEndDate={{this.courseEndDate}}
    />`);
    const selectedDate = new Date(component.startDate.value);
    assert.equal(
      selectedDate.getFullYear(),
      today.year(),
      'Selected year initialized to course start date year.'
    );
    assert.equal(
      selectedDate.getMonth(),
      today.month(),
      'Selected month initialized to course start date month.'
    );
    assert.equal(
      selectedDate.getDate(),
      today.date(),
      'Selected day initialized to course start date day.'
    );
  });

  test('close sends close', async function(assert) {
    assert.expect(1);
    this.set('close', () => {
      assert.ok(true);
    });
    await render(hbs`<OfferingForm @close={{this.close}} />`);
    await component.close();
  });

  test('save not recurring', async function(assert) {
    assert.expect(7);
    this.set('save', async (startDate, endDate, room, learners, learnerGroups, instructorGroups, instructors) => {
      assert.equal(moment(startDate).format('YYYY-MM-DD'), moment().format('YYYY-MM-DD'));
      assert.equal(moment(endDate).format('YYYY-MM-DD'), moment().format('YYYY-MM-DD'));
      assert.equal(room, 'TBD');
      assert.equal(learnerGroups.length, 0);
      assert.equal(learners.length, 0);
      assert.equal(instructorGroups.length, 0);
      assert.equal(instructors.length, 0);
    });
    await render(hbs`<OfferingForm @close={{noop}} @save={{this.save}} />`);
    await component.save();
  });

  test('save recurring one week with days selected before initial date', async function(assert) {
    assert.expect(2);
    const wednesday = moment().add(1, 'week').day(3);
    const thursday = wednesday.clone().add(1, 'day').day();
    const tuesday = wednesday.clone().subtract(1, 'day').day();
    const newStartDate = wednesday.toDate();
    let savedCount = 0;
    this.set('save', async (startDate) => {
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
    });
    await render(hbs`<OfferingForm
      @close={{noop}}
      @showMakeRecurring={{true}}
      @save={{this.save}}
    />`);
    await component.recurring.toggle();
    await component.startDate.set(newStartDate);
    await component.recurring.weekdays[tuesday].input.toggle();
    await component.recurring.weekdays[thursday].input.toggle();
    await component.save();
  });

  test('save recurring 3 weeks should get lots of days', async function(assert) {
    assert.expect(8);
    const wednesday = moment().add(1, 'week').day(3);
    const thursday = wednesday.clone().add(1, 'day').day();
    const tuesday = wednesday.clone().subtract(1, 'day').day();
    const newStartDate = wednesday.toDate();
    let savedCount = 0;
    this.set('save', async (startDate) => {
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
    });
    await render(hbs`<OfferingForm
      @close={{noop}}
      @showMakeRecurring={{true}}
      @save={{this.save}}
    />`);
    await component.recurring.toggle();
    await component.recurring.setWeeks("3");
    await component.startDate.set(newStartDate);
    await component.recurring.weekdays[tuesday].input.toggle();
    await component.recurring.weekdays[thursday].input.toggle();
    await component.save();
  });

  test('changing start date changes end date', async function(assert) {
    await render(hbs`<OfferingForm @close={{noop}} />`);
    const format = 'M/D/YYYY h:mm a';
    const newStartDate = moment().add(1, 'day').toDate();
    assert.equal(moment().hour(9).minute(0).format(format), component.endDate.value);
    await component.startDate.set(newStartDate);
    assert.equal(moment(newStartDate).hour(9).minute(0).format(format), component.endDate.value);
  });

  test('changing start time changes end date', async function(assert) {
    await render(hbs`<OfferingForm @close={{noop}} />`);
    const format = 'M/D/YYYY h:mm a';
    assert.equal(moment().hour(9).minute(0).format(format), component.endDate.value);
    await component.startTime.hour('2');
    await component.startTime.minutes('15');
    await component.startTime.ampm('pm');
    assert.equal(moment().hour(15).minute(15).format(format), component.endDate.value);
  });

  test('changing duration changes end date', async function(assert) {
    await render(hbs`<OfferingForm @close={{noop}} />`);
    const format = 'M/D/YYYY h:mm a';
    assert.equal(moment().hour(9).minute(0).format(format), component.endDate.value);
    await component.duration.hours.set('2');
    await component.duration.minutes.set('15');
    assert.equal(moment().hour(10).minute(15).format(format), component.endDate.value);
  });

  // @see https://github.com/ilios/frontend/issues/1903
  test('changing duration and start time changes end date', async function(assert) {
    await render(hbs`<OfferingForm @close={{noop}} />`);
    const format = 'M/D/YYYY h:mm a';
    assert.equal(moment().hour(9).minute(0).format(format), component.endDate.value);
    await component.startTime.hour('2');
    await component.startTime.minutes('10');
    await component.startTime.ampm('pm');
    await component.duration.hours.set('2');
    await component.duration.minutes.set( '50');
    assert.equal(moment().hour(17).minute(0).format(format), component.endDate.value);
  });

  test('learner manager is not present in small-group mode', async function(assert) {
    await render(hbs`<OfferingForm @close={{noop}} @smallGroupMode={{true}} />`);
    assert.notOk(component.learners.isPresent);
  });

  test('learner manager is present in single-offering mode', async function(assert) {
    await render(hbs`<OfferingForm @close={{noop}} @smallGroupMode={{false}} />`);
    assert.ok(component.learners.isPresent);
  });

  test('learnerGroup validation errors do not show up initially', async function(assert) {
    await render(hbs`<OfferingForm @close={{noop}} @smallGroupMode={{true}} />`);
    assert.notOk(component.learnerGroups.hasError);
  });

  test('learnerGroup validation errors show up when saving', async function(assert) {
    await render(hbs`<OfferingForm @close={{noop}} @smallGroupMode={{true}} />`);
    await component.save();
    assert.ok(component.learnerGroups.hasError);
  });

  test('renders when an offering is provided', async function(assert) {
    const offering = this.server.create('offering', {
      room: 'emerald bay',
      startDate: moment('2005-06-24').hour(18).minute(24).toDate(),
      endDate: moment('2005-06-24').hour(19).minute(24).toDate(),
    });
    const offeringModel = await this.owner.lookup('service:store').find('offering', offering.id);
    this.set('offering', offeringModel);
    await render(hbs`<OfferingForm
      @offering={{this.offering}}
      @close={{noop}}
      @showRoom={{true}}
      @showMakeRecurring={{true}}
      @showInstructors={{true}}
    />`);
    assert.equal(component.location.value, 'emerald bay');
    assert.equal(component.duration.hours.value, '1');
    assert.equal(component.duration.minutes.value, '0');
    const selectedDate = new Date(component.startDate.value);
    assert.equal(
      selectedDate.getFullYear(),
      offeringModel.startDate.getFullYear(),
      'Selected year initialized to offering start date year.'
    );
    assert.equal(
      selectedDate.getMonth(),
      offeringModel.startDate.getMonth(),
      'Selected month initialized to offering start date month.'
    );
    assert.equal(
      selectedDate.getDate(),
      offeringModel.startDate.getDate(),
      'Selected day initialized to offering start date day.'
    );
  });

  test('shows current timezone', async function(assert) {
    await render(hbs`<OfferingForm @close={{noop}} />`);
    const timezoneService = this.owner.lookup('service:timezone');
    const currentTimezone = moment.tz.guess();
    assert.equal(component.currentTimezone.text, timezoneService.formatTimezone(currentTimezone));
  });

  test('save date with new timezone', async function(assert) {
    assert.expect(11);
    const newTimezone = 'Pacific/Midway';
    const utc = 'Etc/UTC';
    const currentTimezone = moment.tz.guess();
    const offering = this.server.create('offering', {
      room: 'emerald bay',
      startDate: moment('2005-06-24').hour(18).minute(24).toDate(),
      endDate: moment('2005-06-24').hour(19).minute(24).toDate(),
    });
    const offeringModel = await this.owner.lookup('service:store').find('offering', offering.id);
    this.set('offering', offeringModel);
    this.set('save', async (startDate, endDate) => {
      assert.equal('2005-06-25 05:24', moment(startDate).tz(utc).format('Y-MM-DD HH:mm'));
      assert.equal('2005-06-25 06:24', moment(endDate).tz(utc).format('Y-MM-DD HH:mm'));
    });
    const timezoneService = this.owner.lookup('service:timezone');
    await render(hbs`<OfferingForm @offering={{this.offering}} @close={{noop}} @save={{this.save}} />`);
    assert.notEqual(newTimezone, currentTimezone);
    assert.notOk(component.timezoneEditor.label.isPresent);
    assert.notOk(component.timezoneEditor.picker.isPresent);
    await component.currentTimezone.edit();
    assert.ok(component.timezoneEditor.label.isPresent);
    assert.ok(component.timezoneEditor.picker.isPresent);
    assert.equal(component.timezoneEditor.picker.value, currentTimezone);
    await component.timezoneEditor.picker.select(newTimezone);
    assert.notOk(component.timezoneEditor.label.isPresent);
    assert.notOk(component.timezoneEditor.picker.isPresent);
    assert.equal(component.currentTimezone.text, timezoneService.formatTimezone(newTimezone));
    await component.save();
  });
});
