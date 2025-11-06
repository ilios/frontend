import { module, test, skip } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { click, render } from '@ember/test-helpers';
import { DateTime } from 'luxon';
import { component } from 'ilios-common/page-objects/components/offering-form';
import { freezeDateAt, unfreezeDate } from 'ilios-common';
import OfferingForm from 'ilios-common/components/offering-form';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | offering form', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.intl = this.owner.lookup('service:intl');

    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('program-year', { program });
    const cohort = this.server.create('cohort', { programYear });
    this.secondLevelLearnerGroup1 = this.server.create('learner-group', {
      title: 'Second 1',
      cohort,
    });
    this.secondLevelLearnerGroup2 = this.server.create('learner-group', {
      title: 'Second 2',
      cohort,
    });
    this.secondLevelLearnerGroup3 = this.server.create('learner-group', {
      title: 'Second 3',
      cohort,
    });
    this.topLevelLearnerGroup1 = this.server.create('learner-group', {
      title: 'Top Group 1',
      children: [this.secondLevelLearnerGroup1, this.secondLevelLearnerGroup2],
      cohort,
    });
    this.topLevelLearnerGroup2 = this.server.create('learner-group', {
      title: 'Top Group 2',
      children: [this.secondLevelLearnerGroup3],
      cohort,
    });
    this.topLevelLearnerGroup3 = this.server.create('learner-group', {
      title: 'Top Group 3',
      cohort,
    });
    this.cohort = cohort;
  });

  hooks.afterEach(() => {
    unfreezeDate();
  });

  test('room and url input do not show by default', async function (assert) {
    await render(<template><OfferingForm @close={{(noop)}} /></template>);
    assert.notOk(component.location.isPresent);
    assert.notOk(component.url.isPresent);
  });

  test('room and url input shows up when requested', async function (assert) {
    await render(<template><OfferingForm @close={{(noop)}} @showRoom={{true}} /></template>);
    assert.ok(component.location.isPresent);
    assert.ok(component.url.isPresent);
  });

  test('room validation errors do not show up initially', async function (assert) {
    await render(<template><OfferingForm @close={{(noop)}} @showRoom={{true}} /></template>);
    assert.notOk(component.location.hasError);
  });

  test('room validation errors show up when typing', async function (assert) {
    await render(<template><OfferingForm @close={{(noop)}} @showRoom={{true}} /></template>);
    await component.location.set('a'.repeat(300));
    await component.save();
    assert.strictEqual(
      component.location.error,
      'Location is too long (maximum is 255 characters)',
    );
  });

  test('room validation succeeds on blank value', async function (assert) {
    await render(
      <template><OfferingForm @close={{(noop)}} @save={{(noop)}} @showRoom={{true}} /></template>,
    );
    await component.location.set('');
    await component.save();
    assert.notOk(component.location.hasError);
  });

  test('url validation errors do not show up initially', async function (assert) {
    await render(<template><OfferingForm @close={{(noop)}} @showRoom={{true}} /></template>);
    assert.notOk(component.url.hasError);
  });

  test('url validation errors show up when typing', async function (assert) {
    await render(<template><OfferingForm @close={{(noop)}} @showRoom={{true}} /></template>);
    await component.url.set('not a url');
    await component.save();
    assert.strictEqual(component.url.error, 'Virtual Learning Link must be a valid url');
  });

  test('url validation errors when URL contains backslash', async function (assert) {
    await render(<template><OfferingForm @close={{(noop)}} @showRoom={{true}} /></template>);
    await component.url.set('https://totallyfineurl.edu/hahajustjokingthisisinvalid\\');
    await component.save();
    assert.strictEqual(component.url.error, 'Virtual Learning Link must be a valid url');
  });

  test('recurring options does not show by default', async function (assert) {
    await render(<template><OfferingForm @close={{(noop)}} /></template>);
    assert.notOk(component.recurring.isPresent);
  });

  test('recurring options shows up when requested', async function (assert) {
    await render(
      <template><OfferingForm @close={{(noop)}} @showMakeRecurring={{true}} /></template>,
    );
    assert.ok(component.recurring.isPresent);
  });

  test('recurring options has all the days of the week', async function (assert) {
    await render(
      <template><OfferingForm @close={{(noop)}} @showMakeRecurring={{true}} /></template>,
    );
    await component.recurring.yesNoToggle.click();
    assert.ok(component.recurring.weekdays[0].label, 'Sunday');
    assert.ok(component.recurring.weekdays[1].label, 'Monday');
    assert.ok(component.recurring.weekdays[2].label, 'Tuesday');
    assert.ok(component.recurring.weekdays[3].label, 'Wednesday');
    assert.ok(component.recurring.weekdays[4].label, 'Thursday');
    assert.ok(component.recurring.weekdays[5].label, 'Friday');
    assert.ok(component.recurring.weekdays[6].label, 'Saturday');
  });

  test('recurring numberOfWeeks validation errors do not show up initially', async function (assert) {
    await render(
      <template><OfferingForm @close={{(noop)}} @showMakeRecurring={{true}} /></template>,
    );
    await component.recurring.yesNoToggle.click();
    assert.notOk(component.recurring.hasError);
  });

  test('recurring numberOfWeeks validation errors show up when saving', async function (assert) {
    await render(
      <template><OfferingForm @close={{(noop)}} @showMakeRecurring={{true}} /></template>,
    );
    await component.recurring.yesNoToggle.click();
    await component.recurring.setWeeks('0');
    await component.save();
    assert.strictEqual(component.recurring.error, 'Weeks must be greater than or equal to 1');
    await component.recurring.setWeeks('1.5');
    await component.save();
    assert.strictEqual(component.recurring.error, 'Weeks must be an integer');
  });

  test('recurring default day is disabled and checked', async function (assert) {
    freezeDateAt(
      DateTime.fromObject({
        year: 2004,
        month: 10,
        day: 24,
        hour: 8,
      }).toJSDate(),
    );
    await render(
      <template><OfferingForm @close={{(noop)}} @showMakeRecurring={{true}} /></template>,
    );
    await component.recurring.yesNoToggle.click();
    assert.ok(component.recurring.weekdays[0].input.isSelected);
    assert.ok(component.recurring.weekdays[0].input.isDisabled);
    assert.notOk(component.recurring.weekdays[1].input.isSelected);
    assert.notOk(component.recurring.weekdays[1].input.isDisabled);
    assert.notOk(component.recurring.weekdays[2].input.isSelected);
    assert.notOk(component.recurring.weekdays[2].input.isDisabled);
    assert.notOk(component.recurring.weekdays[3].input.isSelected);
    assert.notOk(component.recurring.weekdays[3].input.isDisabled);
    assert.notOk(component.recurring.weekdays[4].input.isSelected);
    assert.notOk(component.recurring.weekdays[4].input.isDisabled);
    assert.notOk(component.recurring.weekdays[5].input.isSelected);
    assert.notOk(component.recurring.weekdays[5].input.isDisabled);
    assert.notOk(component.recurring.weekdays[6].input.isSelected);
    assert.notOk(component.recurring.weekdays[6].input.isDisabled);
  });

  test('instructor manager does not show by default', async function (assert) {
    await render(<template><OfferingForm @close={{(noop)}} /></template>);
    assert.notOk(component.instructorSelectionManager.isPresent);
  });

  test('instructor manager shows up when requested', async function (assert) {
    await render(<template><OfferingForm @close={{(noop)}} @showInstructors={{true}} /></template>);
    assert.ok(component.instructorSelectionManager.isPresent);
  });

  test('before course startDate default initial startDate falls on course start date', async function (assert) {
    const courseStartDate = DateTime.fromObject({ hour: 8 }).plus({ days: 2 });
    const courseEndDate = DateTime.fromObject({ hour: 8 }).plus({ days: 4 });
    this.set('courseStartDate', courseStartDate.toJSDate());
    this.set('courseEndDate', courseEndDate.toJSDate());
    await render(
      <template>
        <OfferingForm
          @close={{(noop)}}
          @courseStartDate={{this.courseStartDate}}
          @courseEndDate={{this.courseEndDate}}
        />
      </template>,
    );
    const selectedDate = DateTime.fromFormat(component.startDate.datePicker.value, 'M/d/y');
    assert.ok(
      selectedDate.hasSame(courseStartDate, 'day'),
      'Selected date initialized to course start date.',
    );
  });

  test('after course endDate default initial startDate falls on course end date', async function (assert) {
    const courseStartDate = DateTime.fromObject({ hour: 8 }).minus({ days: 4 });
    const courseEndDate = DateTime.fromObject({ hour: 8 }).minus({ days: 2 });
    this.set('courseStartDate', courseStartDate.toJSDate());
    this.set('courseEndDate', courseEndDate.toJSDate());
    await render(
      <template>
        <OfferingForm
          @close={{(noop)}}
          @courseStartDate={{this.courseStartDate}}
          @courseEndDate={{this.courseEndDate}}
        />
      </template>,
    );
    const selectedDate = DateTime.fromFormat(component.startDate.datePicker.value, 'M/d/y');
    assert.ok(
      selectedDate.hasSame(courseEndDate, 'day'),
      'Selected date initialized to course end date.',
    );
  });

  test('between course startDate and endDate default initial startDate falls on today', async function (assert) {
    const courseStartDate = DateTime.fromObject({ hour: 8 }).minus({ days: 4 });
    const courseEndDate = DateTime.fromObject({ hour: 8 }).plus({ days: 4 });
    const today = DateTime.fromObject({ hour: 8 });
    this.set('courseStartDate', courseStartDate.toJSDate());
    this.set('courseEndDate', courseEndDate.toJSDate());
    await render(
      <template>
        <OfferingForm
          @close={{(noop)}}
          @courseStartDate={{this.courseStartDate}}
          @courseEndDate={{this.courseEndDate}}
        />
      </template>,
    );
    const selectedDate = DateTime.fromFormat(component.startDate.datePicker.value, 'M/d/y');
    assert.ok(selectedDate.hasSame(today, 'day'), 'Selected date initialized to today.');
  });

  test('close sends close', async function (assert) {
    this.set('close', () => {
      assert.step('close called');
    });
    await render(<template><OfferingForm @close={{this.close}} /></template>);
    await component.close();
    assert.verifySteps(['close called']);
  });

  test('save not recurring', async function (assert) {
    this.set(
      'save',
      async (
        startDate,
        endDate,
        room,
        url,
        learners,
        learnerGroups,
        instructorGroups,
        instructors,
      ) => {
        assert.step('save called');
        const today = DateTime.fromObject({ hour: 8 });
        assert.ok(today.hasSame(DateTime.fromJSDate(startDate), 'day'));
        assert.ok(today.hasSame(DateTime.fromJSDate(endDate), 'day'));
        assert.strictEqual(room, null);
        assert.strictEqual(url, null);
        assert.strictEqual(learnerGroups.length, 0);
        assert.strictEqual(learners.length, 0);
        assert.strictEqual(instructorGroups.length, 0);
        assert.strictEqual(instructors.length, 0);
      },
    );
    await render(<template><OfferingForm @close={{(noop)}} @save={{this.save}} /></template>);
    await component.save();
    assert.verifySteps(['save called']);
  });

  test('save recurring one week with days selected before initial date', async function (assert) {
    const wednesday = DateTime.fromObject({ hour: 8, weekday: 3 }).plus({ week: 1 });
    const thursday = wednesday.plus({ days: 1 });
    const tuesday = wednesday.minus({ days: 1 });
    const newStartDate = wednesday.toJSDate();
    let savedCount = 0;
    this.set('save', async (startDate) => {
      assert.step('save called');
      assert.ok(savedCount <= 1, 'should only get two saved offerings, we got ' + (savedCount + 1));
      let expectedStartDate;
      switch (savedCount) {
        case 0:
          expectedStartDate = wednesday;
          break;
        case 1:
          expectedStartDate = thursday;
          break;
      }
      assert.ok(expectedStartDate.hasSame(DateTime.fromJSDate(startDate), 'day'));

      savedCount++;
    });
    await render(
      <template>
        <OfferingForm @close={{(noop)}} @showMakeRecurring={{true}} @save={{this.save}} />
      </template>,
    );
    await component.recurring.yesNoToggle.click();
    await component.startDate.datePicker.set(newStartDate);
    await component.recurring.weekdays[tuesday.weekday].input.toggle();
    await component.recurring.weekdays[thursday.weekday].input.toggle();
    await component.save();
    assert.verifySteps(['save called', 'save called']);
  });

  test('save recurring 3 weeks should get lots of days', async function (assert) {
    const wednesday = DateTime.fromObject({ hour: 8, weekday: 3 }).plus({ week: 1 });
    const thursday = wednesday.plus({ days: 1 });
    const tuesday = wednesday.minus({ days: 1 });
    const newStartDate = wednesday.toJSDate();
    let savedCount = 0;
    this.set('save', async (startDate) => {
      assert.step('save called');
      assert.ok(
        savedCount <= 7,
        'should only get eight saved offerings, we got ' +
          (savedCount + 1) +
          ' with startDate ' +
          DateTime.fromJSDate(startDate).toISO(),
      );
      let expectedStartDate;
      switch (savedCount) {
        case 0:
          expectedStartDate = wednesday;
          break;
        case 1:
          expectedStartDate = wednesday.plus({ days: 1 });
          break;
        case 2:
          expectedStartDate = wednesday.minus({ days: 1 }).plus({ weeks: 1 });
          break;
        case 3:
          expectedStartDate = wednesday.plus({ weeks: 1 });
          break;
        case 4:
          expectedStartDate = wednesday.plus({ days: 1, weeks: 1 });
          break;
        case 5:
          expectedStartDate = wednesday.minus({ days: 1 }).plus({ weeks: 2 });
          break;
        case 6:
          expectedStartDate = wednesday.plus({ weeks: 2 });
          break;
        case 7:
          expectedStartDate = wednesday.plus({ days: 1, weeks: 2 });
          break;
      }
      assert.ok(expectedStartDate.hasSame(DateTime.fromJSDate(startDate), 'day'));

      savedCount++;
    });
    await render(
      <template>
        <OfferingForm @close={{(noop)}} @showMakeRecurring={{true}} @save={{this.save}} />
      </template>,
    );
    await component.recurring.yesNoToggle.click();
    await component.recurring.setWeeks('3');
    await component.startDate.datePicker.set(newStartDate);
    await component.recurring.weekdays[tuesday.weekday].input.toggle();
    await component.recurring.weekdays[thursday.weekday].input.toggle();
    await component.save();
    assert.verifySteps(Array(8).fill('save called'));
  });

  test('changing start date changes end date', async function (assert) {
    await render(<template><OfferingForm @close={{(noop)}} /></template>);
    const newStartDate = DateTime.fromObject({ hour: 9 }).plus({ days: 1 });
    assert.strictEqual(
      this.intl.formatDate(DateTime.fromObject({ hour: 9, minute: 0 }).toJSDate(), {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      component.endDate.value,
    );
    await component.startDate.datePicker.set(newStartDate.toJSDate());
    assert.strictEqual(
      this.intl.formatDate(newStartDate.set({ hour: 9, minute: 0 }).toJSDate(), {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      component.endDate.value,
    );
  });

  test('changing start time changes end date', async function (assert) {
    await render(<template><OfferingForm @close={{(noop)}} /></template>);
    assert.strictEqual(
      component.endDate.value,
      this.intl.formatDate(DateTime.fromObject({ hour: 9, minute: 0 }).toJSDate(), {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    );
    await component.startTime.timePicker.hour.select('02');
    await component.startTime.timePicker.minute.select('15');
    await component.startTime.timePicker.ampm.select('PM');
    assert.strictEqual(
      component.endDate.value,
      this.intl.formatDate(DateTime.fromObject({ hour: 15, minute: 15 }).toJSDate(), {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    );
  });

  test('changing duration changes end date', async function (assert) {
    await render(<template><OfferingForm @close={{(noop)}} /></template>);
    assert.strictEqual(
      this.intl.formatDate(DateTime.fromObject({ hour: 9, minute: 0 }).toJSDate(), {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      component.endDate.value,
    );
    await component.duration.hours.set('2');
    await component.duration.minutes.set('15');
    assert.strictEqual(
      this.intl.formatDate(DateTime.fromObject({ hour: 10, minute: 15 }).toJSDate(), {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      component.endDate.value,
    );
  });

  // @see https://github.com/ilios/frontend/issues/1903
  test('changing duration and start time changes end date', async function (assert) {
    await render(<template><OfferingForm @close={{(noop)}} /></template>);
    assert.strictEqual(
      this.intl.formatDate(DateTime.fromObject({ hour: 9, minute: 0 }).toJSDate(), {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      component.endDate.value,
    );
    await component.startTime.timePicker.hour.select('02');
    await component.startTime.timePicker.minute.select('10');
    await component.startTime.timePicker.ampm.select('PM');
    await component.duration.hours.set('2');
    await component.duration.minutes.set('50');
    assert.strictEqual(
      this.intl.formatDate(DateTime.fromObject({ hour: 17, minute: 0 }).toJSDate(), {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      component.endDate.value,
    );
  });

  test('duration validation fails if both minutes and hours are zero', async function (assert) {
    await render(
      <template><OfferingForm @close={{(noop)}} @save={{(noop)}} @showRoom={{true}} /></template>,
    );
    assert.notOk(component.duration.hours.hasError);
    assert.notOk(component.duration.minutes.hasError);
    await component.duration.hours.set('0');
    await component.duration.minutes.set('0');
    await component.save();
    assert.strictEqual(component.duration.hours.error, 'Hours must be greater than or equal to 0');
    assert.strictEqual(
      component.duration.minutes.error,
      'Minutes must be greater than or equal to 0',
    );
  });

  test('blanking minutes or hours is ignored', async function (assert) {
    await render(<template><OfferingForm @close={{(noop)}} @save={{(noop)}} /></template>);

    // Verify the initial end-date.
    assert.strictEqual(
      this.intl.formatDate(DateTime.fromObject({ hour: 9, minute: 0 }).toJSDate(), {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      component.endDate.value,
    );

    // Change the duration, verify the calculated end-date.
    await component.duration.minutes.set('4');
    await component.duration.hours.set('9');
    const newEndDate = this.intl.formatDate(
      DateTime.fromObject({ hour: 17, minute: 4 }).toJSDate(),
      {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
    );
    assert.strictEqual(newEndDate, component.endDate.value);

    // Provide blank input for the duration fields, verify that the end-date does not change again.
    await component.duration.minutes.set('');
    await component.duration.hours.set('');
    assert.strictEqual(newEndDate, component.endDate.value);

    // Change the duration again, verify that the calculated end-date has changed and is correct.
    await component.duration.minutes.set('12');
    await component.duration.hours.set('2');
    assert.strictEqual(
      this.intl.formatDate(DateTime.fromObject({ hour: 10, minute: 12 }).toJSDate(), {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      component.endDate.value,
    );
  });

  test('learner manager is not present in small-group mode', async function (assert) {
    await render(<template><OfferingForm @close={{(noop)}} @smallGroupMode={{true}} /></template>);
    assert.notOk(component.learnerManager.learnerSelectionManager.isPresent);
  });

  test('learner manager is present in single-offering mode', async function (assert) {
    await render(<template><OfferingForm @close={{(noop)}} @smallGroupMode={{false}} /></template>);
    assert.ok(component.learnerManager.learnerSelectionManager.isPresent);
  });

  test('learnerGroup validation errors do not show up initially', async function (assert) {
    await render(<template><OfferingForm @close={{(noop)}} @smallGroupMode={{true}} /></template>);
    assert.notOk(component.learnerManager.hasError);
  });

  test('learnerGroup validation errors show up when saving', async function (assert) {
    await render(<template><OfferingForm @close={{(noop)}} @smallGroupMode={{true}} /></template>);
    await component.save();
    assert.strictEqual(component.learnerManager.error, 'Learner Groups can not be empty');
  });

  test('renders when an offering is provided', async function (assert) {
    const offering = this.server.create('offering', {
      room: 'emerald bay',
      startDate: DateTime.fromObject({
        year: 2005,
        month: 6,
        day: 24,
        hour: 18,
        minute: 24,
      }).toJSDate(),
      endDate: DateTime.fromObject({
        year: 2005,
        month: 6,
        day: 24,
        hour: 19,
        minute: 24,
      }).toJSDate(),
    });
    const offeringModel = await this.owner
      .lookup('service:store')
      .findRecord('offering', offering.id);
    this.set('offering', offeringModel);
    await render(
      <template>
        <OfferingForm
          @offering={{this.offering}}
          @close={{(noop)}}
          @showRoom={{true}}
          @showMakeRecurring={{true}}
          @showInstructors={{true}}
        />
      </template>,
    );
    assert.strictEqual(component.location.value, 'emerald bay');
    assert.strictEqual(component.duration.hours.value, '1');
    assert.strictEqual(component.duration.minutes.value, '0');
    const selectedDate = DateTime.fromFormat(component.startDate.datePicker.value, 'M/d/y');
    assert.ok(
      selectedDate.hasSame(DateTime.fromJSDate(offering.startDate), 'day'),
      'Selected date initialized to offering start date day.',
    );
  });

  test('shows current timezone', async function (assert) {
    await render(<template><OfferingForm @close={{(noop)}} /></template>);
    const timezoneService = this.owner.lookup('service:timezone');
    const currentTimezone = DateTime.local().zoneName;
    assert.strictEqual(
      component.timezoneEditor.currentTimezone.text,
      timezoneService.formatTimezone(currentTimezone),
    );
  });

  test('save date with new timezone', async function (assert) {
    const newTimezone = 'Pacific/Midway';
    const currentTimezone = DateTime.local().zoneName;
    const startDateTime = DateTime.fromObject({
      year: 2005,
      month: 6,
      day: 24,
      hour: 18,
      minute: 24,
    });
    const endDateTime = DateTime.fromObject({
      year: 2005,
      month: 6,
      day: 24,
      hour: 19,
      minute: 24,
    });
    const offering = this.server.create('offering', {
      room: 'emerald bay',
      startDate: startDateTime.toJSDate(),
      endDate: endDateTime.toJSDate(),
    });
    const offeringModel = await this.owner
      .lookup('service:store')
      .findRecord('offering', offering.id);
    this.set('offering', offeringModel);
    this.set('save', async (startDate, endDate) => {
      assert.step('save called');
      assert.strictEqual(
        DateTime.fromJSDate(startDate).toUTC().toISO(),
        '2005-06-25T05:24:00.000Z',
      );
      assert.strictEqual(DateTime.fromJSDate(endDate).toUTC().toISO(), '2005-06-25T06:24:00.000Z');
    });
    const timezoneService = this.owner.lookup('service:timezone');
    await render(
      <template>
        <OfferingForm @offering={{this.offering}} @close={{(noop)}} @save={{this.save}} />
      </template>,
    );
    assert.notEqual(newTimezone, currentTimezone);
    assert.notOk(component.timezoneEditor.picker.isPresent);
    await component.timezoneEditor.currentTimezone.edit();
    assert.ok(component.timezoneEditor.picker.isPresent);
    assert.strictEqual(component.timezoneEditor.picker.value, currentTimezone);
    await component.timezoneEditor.picker.select(newTimezone);
    assert.notOk(component.timezoneEditor.picker.isPresent);
    assert.strictEqual(
      component.timezoneEditor.currentTimezone.text,
      timezoneService.formatTimezone(newTimezone),
    );
    await component.save();
    assert.verifySteps(['save called']);
  });

  test('removes double https from start of URL when input', async function (assert) {
    await render(<template><OfferingForm @close={{(noop)}} @showRoom={{true}} /></template>);
    await component.url.set('https://http://example.com');
    assert.strictEqual(component.url.value, 'http://example.com');
    await component.url.set('https://https://example.edu');
    assert.strictEqual(component.url.value, 'https://example.edu');
  });

  test('trims whitespace from URL input #1500', async function (assert) {
    await render(<template><OfferingForm @close={{(noop)}} @showRoom={{true}} /></template>);
    await component.url.set('  http://example.com  ');
    assert.strictEqual(component.url.value, 'http://example.com');
  });

  skip('rejects query param with trailing slash ilios/ilios#3050', async function (assert) {
    await render(<template><OfferingForm @close={{(noop)}} @showRoom={{true}} /></template>);
    assert.notOk(component.url.hasError);
    await component.url.set('http://example.com?jayden=awesome/');
    assert.strictEqual(component.url.error, 'Virtual Learning Link must be a valid url');
  });

  test('learner groups sort order', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('program-year', { program });
    const cohort = this.server.create('cohort', { programYear });
    this.server.create('learner-group', { cohort, title: 'Learner Group 1' });
    this.server.create('learner-group', { cohort, title: 'Learner Group 10' });
    this.server.create('learner-group', { cohort, title: 'Learner Group 2' });

    const cohortModel = await this.owner.lookup('service:store').findRecord('cohort', cohort.id);
    this.set('cohorts', [cohortModel]);
    await render(<template><OfferingForm @cohorts={{this.cohorts}} @close={{(noop)}} /></template>);

    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .title,
      'Learner Group 1',
    );
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[1]
        .title,
      'Learner Group 2',
    );
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[2]
        .title,
      'Learner Group 10',
    );
  });

  test('save by pressing enter in duration hours field', async function (assert) {
    const offering = this.server.create('offering');
    const offeringModel = await this.owner
      .lookup('service:store')
      .findRecord('offering', offering.id);
    this.set('offering', offeringModel);
    this.set('save', () => {
      assert.step('save called');
    });
    await render(
      <template>
        <OfferingForm @offering={{this.offering}} @close={{(noop)}} @save={{this.save}} />
      </template>,
    );
    await component.duration.hours.submit();
    assert.verifySteps(['save called']);
  });

  test('save by pressing enter in duration minutes field', async function (assert) {
    const offering = this.server.create('offering');
    const offeringModel = await this.owner
      .lookup('service:store')
      .findRecord('offering', offering.id);
    this.set('offering', offeringModel);
    this.set('save', () => {
      assert.step('save called');
    });
    await render(
      <template>
        <OfferingForm @offering={{this.offering}} @close={{(noop)}} @save={{this.save}} />
      </template>,
    );
    await component.duration.minutes.submit();
    assert.verifySteps(['save called']);
  });

  test('save by pressing enter in location field', async function (assert) {
    const offering = this.server.create('offering');
    const offeringModel = await this.owner
      .lookup('service:store')
      .findRecord('offering', offering.id);
    this.set('offering', offeringModel);
    this.set('save', () => {
      assert.step('save called');
    });
    await render(
      <template>
        <OfferingForm
          @offering={{this.offering}}
          @close={{(noop)}}
          @showRoom={{true}}
          @save={{this.save}}
        />
      </template>,
    );
    await component.location.submit();
    assert.verifySteps(['save called']);
  });

  test('save by pressing enter in url field', async function (assert) {
    const offering = this.server.create('offering');
    const offeringModel = await this.owner
      .lookup('service:store')
      .findRecord('offering', offering.id);
    this.set('offering', offeringModel);
    this.set('save', () => {
      assert.step('save called');
    });
    await render(
      <template>
        <OfferingForm
          @offering={{this.offering}}
          @close={{(noop)}}
          @showRoom={{true}}
          @save={{this.save}}
        />
      </template>,
    );
    await component.url.submit();
    assert.verifySteps(['save called']);
  });

  test('remove learner group from picker', async function (assert) {
    const offering = this.server.create('offering', {
      learnerGroups: [
        this.secondLevelLearnerGroup1,
        this.secondLevelLearnerGroup2,
        this.topLevelLearnerGroup3,
      ],
    });
    const offeringModel = await this.owner
      .lookup('service:store')
      .findRecord('offering', offering.id);
    const cohortModel = await this.owner
      .lookup('service:store')
      .findRecord('cohort', this.cohort.id);
    this.set('offering', offeringModel);
    this.set('cohorts', [cohortModel]);
    await render(
      <template>
        <OfferingForm
          @offering={{this.offering}}
          @cohorts={{this.cohorts}}
          @close={{(noop)}}
          @save={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.selectedLearnerGroups
        .detailLearnergroupsList.trees[0].items.length,
      3,
    );
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts.length,
      1,
    );
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees.length,
      3,
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .isChecked,
    );
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups.length,
      2,
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[0].isChecked,
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[1].isChecked,
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[1]
        .isChecked,
    );
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[1]
        .subgroups.length,
      1,
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[1]
        .subgroups[0].isChecked,
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[2]
        .isChecked,
    );
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[2]
        .subgroups.length,
      0,
    );
    await component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups[0].toggle();
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.selectedLearnerGroups
        .detailLearnergroupsList.trees[0].items.length,
      2,
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[0].isChecked,
    );
  });

  test('remove learner group from list', async function (assert) {
    const offering = this.server.create('offering', {
      learnerGroups: [
        this.secondLevelLearnerGroup1,
        this.secondLevelLearnerGroup2,
        this.topLevelLearnerGroup3,
      ],
    });
    const offeringModel = await this.owner
      .lookup('service:store')
      .findRecord('offering', offering.id);
    const cohortModel = await this.owner
      .lookup('service:store')
      .findRecord('cohort', this.cohort.id);
    this.set('offering', offeringModel);
    this.set('cohorts', [cohortModel]);
    await render(
      <template>
        <OfferingForm
          @offering={{this.offering}}
          @cohorts={{this.cohorts}}
          @close={{(noop)}}
          @save={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.selectedLearnerGroups
        .detailLearnergroupsList.trees[0].items.length,
      3,
    );
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts.length,
      1,
    );
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees.length,
      3,
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .isChecked,
    );
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups.length,
      2,
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[0].isChecked,
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[1].isChecked,
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[1]
        .isChecked,
    );
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[1]
        .subgroups.length,
      1,
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[1]
        .subgroups[0].isChecked,
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[2]
        .isChecked,
    );
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[2]
        .subgroups.length,
      0,
    );
    await component.learnerManager.learnergroupSelectionManager.selectedLearnerGroups.detailLearnergroupsList.trees[0].items[0].remove();
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.selectedLearnerGroups
        .detailLearnergroupsList.trees[0].items.length,
      2,
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[0].isChecked,
    );
  });

  test('add available learner group', async function (assert) {
    const offering = this.server.create('offering', {
      learnerGroups: [
        this.secondLevelLearnerGroup1,
        this.secondLevelLearnerGroup2,
        this.topLevelLearnerGroup3,
      ],
    });
    const offeringModel = await this.owner
      .lookup('service:store')
      .findRecord('offering', offering.id);
    const cohortModel = await this.owner
      .lookup('service:store')
      .findRecord('cohort', this.cohort.id);
    this.set('offering', offeringModel);
    this.set('cohorts', [cohortModel]);
    await render(
      <template>
        <OfferingForm
          @offering={{this.offering}}
          @cohorts={{this.cohorts}}
          @close={{(noop)}}
          @save={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.selectedLearnerGroups
        .detailLearnergroupsList.trees[0].items.length,
      3,
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[1]
        .subgroups[0].isChecked,
    );
    await component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[1].subgroups[0].toggle();
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.selectedLearnerGroups
        .detailLearnergroupsList.trees[0].items.length,
      4,
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[1]
        .subgroups[0].isChecked,
    );
  });

  test('adding a learner group with children adds them as well', async function (assert) {
    const offering = this.server.create('offering', {
      learnerGroups: [
        this.secondLevelLearnerGroup1,
        this.secondLevelLearnerGroup2,
        this.topLevelLearnerGroup3,
      ],
    });
    const offeringModel = await this.owner
      .lookup('service:store')
      .findRecord('offering', offering.id);
    const cohortModel = await this.owner
      .lookup('service:store')
      .findRecord('cohort', this.cohort.id);
    this.set('offering', offeringModel);
    this.set('cohorts', [cohortModel]);
    await render(
      <template>
        <OfferingForm
          @offering={{this.offering}}
          @cohorts={{this.cohorts}}
          @close={{(noop)}}
          @save={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.selectedLearnerGroups
        .detailLearnergroupsList.trees[0].items.length,
      3,
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[1]
        .isChecked,
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[1]
        .subgroups[0].isChecked,
    );
    await component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[1].toggle();
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.selectedLearnerGroups
        .detailLearnergroupsList.trees[0].items.length,
      5,
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[1]
        .isChecked,
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[1]
        .subgroups[0].isChecked,
    );
  });

  test('removing a learner group with children from the picker removes them as well', async function (assert) {
    const offering = this.server.create('offering', {
      learnerGroups: [
        this.secondLevelLearnerGroup1,
        this.secondLevelLearnerGroup2,
        this.topLevelLearnerGroup1,
      ],
    });
    const offeringModel = await this.owner
      .lookup('service:store')
      .findRecord('offering', offering.id);
    const cohortModel = await this.owner
      .lookup('service:store')
      .findRecord('cohort', this.cohort.id);
    this.set('offering', offeringModel);
    this.set('cohorts', [cohortModel]);
    await render(
      <template>
        <OfferingForm
          @offering={{this.offering}}
          @cohorts={{this.cohorts}}
          @close={{(noop)}}
          @save={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.selectedLearnerGroups
        .detailLearnergroupsList.trees[0].items.length,
      3,
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .isChecked,
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[0].isChecked,
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[1].isChecked,
    );
    await component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].toggle();
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.selectedLearnerGroups
        .detailLearnergroupsList.trees[0].items.length,
      0,
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .isChecked,
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[0].isChecked,
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[1].isChecked,
    );
  });

  test('removing a learner group with children from the list removes them as well', async function (assert) {
    const offering = this.server.create('offering', {
      learnerGroups: [
        this.secondLevelLearnerGroup1,
        this.secondLevelLearnerGroup2,
        this.topLevelLearnerGroup1,
      ],
    });
    const offeringModel = await this.owner
      .lookup('service:store')
      .findRecord('offering', offering.id);
    const cohortModel = await this.owner
      .lookup('service:store')
      .findRecord('cohort', this.cohort.id);
    this.set('offering', offeringModel);
    this.set('cohorts', [cohortModel]);
    await render(
      <template>
        <OfferingForm
          @offering={{this.offering}}
          @cohorts={{this.cohorts}}
          @close={{(noop)}}
          @save={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.selectedLearnerGroups
        .detailLearnergroupsList.trees[0].items.length,
      3,
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .isChecked,
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[0].isChecked,
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[1].isChecked,
    );
    await component.learnerManager.learnergroupSelectionManager.selectedLearnerGroups.detailLearnergroupsList.trees[0].items[0].remove();
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.selectedLearnerGroups
        .detailLearnergroupsList.trees[0].items.length,
      0,
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .isChecked,
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[0].isChecked,
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[1].isChecked,
    );
  });

  test('selectively adding a learner group with children does not add the children', async function (assert) {
    const offering = this.server.create('offering');
    const offeringModel = await this.owner
      .lookup('service:store')
      .findRecord('offering', offering.id);
    const cohortModel = await this.owner
      .lookup('service:store')
      .findRecord('cohort', this.cohort.id);
    this.set('offering', offeringModel);
    this.set('cohorts', [cohortModel]);
    await render(
      <template>
        <OfferingForm
          @offering={{this.offering}}
          @cohorts={{this.cohorts}}
          @close={{(noop)}}
          @save={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.selectedLearnerGroups
        .detailLearnergroupsList.trees[0].items.length,
      0,
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .isChecked,
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[0].isChecked,
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[0].isChecked,
    );
    await click('[data-test-learnergroup-tree-root=true] > [data-test-checkbox]', {
      shiftKey: true,
    });
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.selectedLearnerGroups
        .detailLearnergroupsList.trees[0].items.length,
      1,
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .isChecked,
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[0].isChecked,
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[1].isChecked,
    );
  });

  test('selectively removing a learner group with children from the picker does not remove the children', async function (assert) {
    const offering = this.server.create('offering', {
      learnerGroups: [
        this.secondLevelLearnerGroup1,
        this.secondLevelLearnerGroup2,
        this.topLevelLearnerGroup1,
      ],
    });
    const offeringModel = await this.owner
      .lookup('service:store')
      .findRecord('offering', offering.id);
    const cohortModel = await this.owner
      .lookup('service:store')
      .findRecord('cohort', this.cohort.id);
    this.set('offering', offeringModel);
    this.set('cohorts', [cohortModel]);
    await render(
      <template>
        <OfferingForm
          @offering={{this.offering}}
          @cohorts={{this.cohorts}}
          @close={{(noop)}}
          @save={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.selectedLearnerGroups
        .detailLearnergroupsList.trees[0].items.length,
      3,
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .isChecked,
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[0].isChecked,
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[0].isChecked,
    );
    await click('[data-test-learnergroup-tree-root=true] > [data-test-checkbox]', {
      shiftKey: true,
    });
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.selectedLearnerGroups
        .detailLearnergroupsList.trees[0].items.length,
      2,
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .isChecked,
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[0].isChecked,
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[1].isChecked,
    );
  });

  test('selectively removing a learner group with children from the list does not remove the children', async function (assert) {
    const offering = this.server.create('offering', {
      learnerGroups: [
        this.secondLevelLearnerGroup1,
        this.secondLevelLearnerGroup2,
        this.topLevelLearnerGroup1,
      ],
    });
    const offeringModel = await this.owner
      .lookup('service:store')
      .findRecord('offering', offering.id);
    const cohortModel = await this.owner
      .lookup('service:store')
      .findRecord('cohort', this.cohort.id);
    this.set('offering', offeringModel);
    this.set('cohorts', [cohortModel]);
    await render(
      <template>
        <OfferingForm
          @offering={{this.offering}}
          @cohorts={{this.cohorts}}
          @close={{(noop)}}
          @save={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.selectedLearnerGroups
        .detailLearnergroupsList.trees[0].items.length,
      3,
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .isChecked,
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[0].isChecked,
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[0].isChecked,
    );
    await click('[data-test-remove-learnergroup]', { at: 0, shiftKey: true });
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.selectedLearnerGroups
        .detailLearnergroupsList.trees[0].items.length,
      2,
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .isChecked,
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[0].isChecked,
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[1].isChecked,
    );
  });
});
