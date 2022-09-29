import { module, test, todo } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { DateTime } from 'luxon';
import { component } from 'ilios-common/page-objects/components/offering-form';

module('Integration | Component | offering form', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
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

  test('room and url input do not show by default', async function (assert) {
    await render(hbs`<OfferingForm @close={{(noop)}} />`);
    assert.notOk(component.location.isPresent);
    assert.notOk(component.url.isPresent);
  });

  test('room and url input shows up when requested', async function (assert) {
    await render(hbs`<OfferingForm @close={{(noop)}} @showRoom={{true}} />`);
    assert.ok(component.location.isPresent);
    assert.ok(component.url.isPresent);
  });

  test('room validation errors do not show up initially', async function (assert) {
    await render(hbs`<OfferingForm @close={{(noop)}} @showRoom={{true}} />`);
    assert.notOk(component.location.hasError);
  });

  test('room validation errors show up when typing', async function (assert) {
    await render(hbs`<OfferingForm @close={{(noop)}} @showRoom={{true}} />`);
    await component.location.set('a'.repeat(300));
    await component.save();
    assert.ok(component.location.hasError);
  });

  test('room validation succeeds on blank value', async function (assert) {
    await render(hbs`<OfferingForm @close={{(noop)}} @save={{(noop)}} @showRoom={{true}} />`);
    await component.location.set('');
    await component.save();
    assert.notOk(component.location.hasError);
  });

  test('url validation errors do not show up initially', async function (assert) {
    await render(hbs`<OfferingForm @close={{(noop)}} @showRoom={{true}} />`);
    assert.notOk(component.url.hasError);
  });

  test('url validation errors show up when typing', async function (assert) {
    await render(hbs`<OfferingForm @close={{(noop)}} @showRoom={{true}} />`);
    await component.url.set('not a url');
    await component.save();
    assert.ok(component.url.hasError);
  });

  test('url validation errors when URL contains backslash', async function (assert) {
    await render(hbs`<OfferingForm @close={{(noop)}} @showRoom={{true}} />`);
    await component.url.set('https://totallyfineurl.edu/hahajustjokingthisisinvalid\\');
    await component.save();
    assert.ok(component.url.hasError);
  });

  test('recurring options does not show by default', async function (assert) {
    await render(hbs`<OfferingForm @close={{(noop)}} />`);
    assert.notOk(component.recurring.isPresent);
  });

  test('recurring options shows up when requested', async function (assert) {
    await render(hbs`<OfferingForm @close={{(noop)}} @showMakeRecurring={{true}} />`);
    assert.ok(component.recurring.isPresent);
  });

  test('recurring options has all the days of the week', async function (assert) {
    await render(hbs`<OfferingForm @close={{(noop)}} @showMakeRecurring={{true}} />`);
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
    await render(hbs`<OfferingForm @close={{(noop)}} @showMakeRecurring={{true}} />`);
    await component.recurring.yesNoToggle.click();
    assert.notOk(component.recurring.hasError);
  });

  test('recurring numberOfWeeks validation errors show up when saving', async function (assert) {
    await render(hbs`<OfferingForm @close={{(noop)}} @showMakeRecurring={{true}} />`);
    await component.recurring.yesNoToggle.click();
    await component.recurring.setWeeks('0');
    await component.save();
    assert.ok(component.recurring.hasError);
  });

  test('recurring default day is disabled and checked', async function (assert) {
    await render(hbs`<OfferingForm @close={{(noop)}} @showMakeRecurring={{true}} />`);
    const dayToday = DateTime.fromObject({ hour: 8 }).weekday;
    await component.recurring.yesNoToggle.click();
    assert.ok(component.recurring.weekdays[dayToday].input.isSelected);
    assert.ok(component.recurring.weekdays[dayToday].input.isDisabled);
  });

  test('instructor manager does not show by default', async function (assert) {
    await render(hbs`<OfferingForm @close={{(noop)}} />`);
    assert.notOk(component.instructorSelectionManager.isPresent);
  });

  test('instructor manager shows up when requested', async function (assert) {
    await render(hbs`<OfferingForm @close={{(noop)}} @showInstructors={{true}} />`);
    assert.ok(component.instructorSelectionManager.isPresent);
  });

  test('before course startDate default initial startDate falls on course start date', async function (assert) {
    const courseStartDate = DateTime.fromObject({ hour: 8 }).plus({ days: 2 });
    const courseEndDate = DateTime.fromObject({ hour: 8 }).plus({ days: 4 });
    this.set('courseStartDate', courseStartDate.toJSDate());
    this.set('courseEndDate', courseEndDate.toJSDate());
    await render(hbs`<OfferingForm
      @close={{(noop)}}
      @courseStartDate={{this.courseStartDate}}
      @courseEndDate={{this.courseEndDate}}
    />`);
    const selectedDate = DateTime.fromFormat(component.startDate.datePicker.value, 'M/d/y');
    assert.ok(
      selectedDate.hasSame(courseStartDate, 'day'),
      'Selected date initialized to course start date.'
    );
  });

  test('after course endDate default initial startDate falls on course end date', async function (assert) {
    const courseStartDate = DateTime.fromObject({ hour: 8 }).minus({ days: 4 });
    const courseEndDate = DateTime.fromObject({ hour: 8 }).minus({ days: 2 });
    this.set('courseStartDate', courseStartDate.toJSDate());
    this.set('courseEndDate', courseEndDate.toJSDate());
    await render(hbs`<OfferingForm
      @close={{(noop)}}
      @courseStartDate={{this.courseStartDate}}
      @courseEndDate={{this.courseEndDate}}
    />`);
    const selectedDate = DateTime.fromFormat(component.startDate.datePicker.value, 'M/d/y');
    assert.ok(
      selectedDate.hasSame(courseEndDate, 'day'),
      'Selected date initialized to course end date.'
    );
  });

  test('between course startDate and endDate default initial startDate falls on today', async function (assert) {
    const courseStartDate = DateTime.fromObject({ hour: 8 }).minus({ days: 4 });
    const courseEndDate = DateTime.fromObject({ hour: 8 }).plus({ days: 4 });
    const today = DateTime.fromObject({ hour: 8 });
    this.set('courseStartDate', courseStartDate.toJSDate());
    this.set('courseEndDate', courseEndDate.toJSDate());
    await render(hbs`<OfferingForm
      @close={{(noop)}}
      @courseStartDate={{this.courseStartDate}}
      @courseEndDate={{this.courseEndDate}}
    />`);
    const selectedDate = DateTime.fromFormat(component.startDate.datePicker.value, 'M/d/y');
    assert.ok(selectedDate.hasSame(today, 'day'), 'Selected date initialized to today.');
  });

  test('close sends close', async function (assert) {
    assert.expect(1);
    this.set('close', () => {
      assert.ok(true);
    });
    await render(hbs`<OfferingForm @close={{this.close}} />`);
    await component.close();
  });

  test('save not recurring', async function (assert) {
    assert.expect(8);
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
        instructors
      ) => {
        const today = DateTime.fromObject({ hour: 8 });
        assert.ok(today.hasSame(DateTime.fromJSDate(startDate), 'day'));
        assert.ok(today.hasSame(DateTime.fromJSDate(endDate), 'day'));
        assert.strictEqual(room, null);
        assert.strictEqual(url, null);
        assert.strictEqual(learnerGroups.length, 0);
        assert.strictEqual(learners.length, 0);
        assert.strictEqual(instructorGroups.length, 0);
        assert.strictEqual(instructors.length, 0);
      }
    );
    await render(hbs`<OfferingForm @close={{(noop)}} @save={{this.save}} />`);
    await component.save();
  });

  test('save recurring one week with days selected before initial date', async function (assert) {
    assert.expect(4);
    const wednesday = DateTime.fromObject({ hour: 8, weekday: 3 }).plus({ week: 1 });
    const thursday = wednesday.plus({ days: 1 });
    const tuesday = wednesday.minus({ days: 1 });
    const newStartDate = wednesday.toJSDate();
    let savedCount = 0;
    this.set('save', async (startDate) => {
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
    await render(hbs`<OfferingForm
      @close={{(noop)}}
      @showMakeRecurring={{true}}
      @save={{this.save}}
    />`);
    await component.recurring.yesNoToggle.click();
    await component.startDate.datePicker.set(newStartDate);
    await component.recurring.weekdays[tuesday.weekday].input.toggle();
    await component.recurring.weekdays[thursday.weekday].input.toggle();
    await component.save();
  });

  test('save recurring 3 weeks should get lots of days', async function (assert) {
    assert.expect(16);
    const wednesday = DateTime.fromObject({ hour: 8, weekday: 3 }).plus({ week: 1 });
    const thursday = wednesday.plus({ days: 1 });
    const tuesday = wednesday.minus({ days: 1 });
    const newStartDate = wednesday.toJSDate();
    let savedCount = 0;
    this.set('save', async (startDate) => {
      assert.ok(
        savedCount <= 7,
        'should only get eight saved offerings, we got ' +
          (savedCount + 1) +
          ' with startDate ' +
          DateTime.fromJSDate(startDate).toISO()
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
    await render(hbs`<OfferingForm
      @close={{(noop)}}
      @showMakeRecurring={{true}}
      @save={{this.save}}
    />`);
    await component.recurring.yesNoToggle.click();
    await component.recurring.setWeeks('3');
    await component.startDate.datePicker.set(newStartDate);
    await component.recurring.weekdays[tuesday.weekday].input.toggle();
    await component.recurring.weekdays[thursday.weekday].input.toggle();
    await component.save();
  });

  test('changing start date changes end date', async function (assert) {
    await render(hbs`<OfferingForm @close={{(noop)}} />`);
    const format = 'M/d/yyyy, h:mm a';
    const newStartDate = DateTime.fromObject({ hour: 9 }).plus({ days: 1 });
    assert.strictEqual(
      DateTime.fromObject({ hour: 9, minute: 0 }).toFormat(format),
      component.endDate.value
    );
    await component.startDate.datePicker.set(newStartDate.toJSDate());
    assert.strictEqual(
      newStartDate.set({ hour: 9, minute: 0 }).toFormat(format),
      component.endDate.value
    );
  });

  test('changing start time changes end date', async function (assert) {
    await render(hbs`<OfferingForm @close={{(noop)}} />`);
    assert.strictEqual(
      component.endDate.value,
      DateTime.fromObject({ hour: 9, minute: 0 }).toLocaleString(DateTime.DATETIME_SHORT)
    );
    await component.startTime.timePicker.hour.select('2');
    await component.startTime.timePicker.minute.select('15');
    await component.startTime.timePicker.ampm.select('pm');
    assert.strictEqual(
      component.endDate.value,
      DateTime.fromObject({ hour: 15, minute: 15 }).toLocaleString(DateTime.DATETIME_SHORT)
    );
  });

  test('changing duration changes end date', async function (assert) {
    await render(hbs`<OfferingForm @close={{(noop)}} />`);
    const format = 'M/d/yyyy, h:mm a';
    assert.strictEqual(
      DateTime.fromObject({ hour: 9, minute: 0 }).toFormat(format),
      component.endDate.value
    );
    await component.duration.hours.set('2');
    await component.duration.minutes.set('15');
    assert.strictEqual(
      DateTime.fromObject({ hour: 10, minute: 15 }).toFormat(format),
      component.endDate.value
    );
  });

  // @see https://github.com/ilios/frontend/issues/1903
  test('changing duration and start time changes end date', async function (assert) {
    await render(hbs`<OfferingForm @close={{(noop)}} />`);
    const format = 'M/d/yyyy, h:mm a';
    assert.strictEqual(
      DateTime.fromObject({ hour: 9, minute: 0 }).toFormat(format),
      component.endDate.value
    );
    await component.startTime.timePicker.hour.select('2');
    await component.startTime.timePicker.minute.select('10');
    await component.startTime.timePicker.ampm.select('pm');
    await component.duration.hours.set('2');
    await component.duration.minutes.set('50');
    assert.strictEqual(
      DateTime.fromObject({ hour: 17, minute: 0 }).toFormat(format),
      component.endDate.value
    );
  });

  test('duration validation fails if both minutes and hours are zero', async function (assert) {
    await render(hbs`<OfferingForm @close={{(noop)}} @save={{(noop)}} @showRoom={{true}} />`);
    assert.notOk(component.duration.hours.hasError);
    assert.notOk(component.duration.minutes.hasError);
    await component.duration.hours.set('0');
    await component.duration.minutes.set('0');
    await component.save();
    assert.ok(component.duration.hours.hasError);
    assert.ok(component.duration.minutes.hasError);
  });

  test('learner manager is not present in small-group mode', async function (assert) {
    await render(hbs`<OfferingForm @close={{(noop)}} @smallGroupMode={{true}} />`);
    assert.notOk(component.learnerManager.learnerSelectionManager.isPresent);
  });

  test('learner manager is present in single-offering mode', async function (assert) {
    await render(hbs`<OfferingForm @close={{(noop)}} @smallGroupMode={{false}} />`);
    assert.ok(component.learnerManager.learnerSelectionManager.isPresent);
  });

  test('learnerGroup validation errors do not show up initially', async function (assert) {
    await render(hbs`<OfferingForm @close={{(noop)}} @smallGroupMode={{true}} />`);
    assert.notOk(component.learnerManager.hasError);
  });

  test('learnerGroup validation errors show up when saving', async function (assert) {
    await render(hbs`<OfferingForm @close={{(noop)}} @smallGroupMode={{true}} />`);
    await component.save();
    assert.ok(component.learnerManager.hasError);
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
    await render(hbs`<OfferingForm
      @offering={{this.offering}}
      @close={{(noop)}}
      @showRoom={{true}}
      @showMakeRecurring={{true}}
      @showInstructors={{true}}
    />`);
    assert.strictEqual(component.location.value, 'emerald bay');
    assert.strictEqual(component.duration.hours.value, '1');
    assert.strictEqual(component.duration.minutes.value, '0');
    const selectedDate = DateTime.fromFormat(component.startDate.datePicker.value, 'M/d/y');
    assert.ok(
      selectedDate.hasSame(DateTime.fromJSDate(offering.startDate), 'day'),
      'Selected date initialized to offering start date day.'
    );
  });

  test('shows current timezone', async function (assert) {
    await render(hbs`<OfferingForm @close={{(noop)}} />`);
    const timezoneService = this.owner.lookup('service:timezone');
    const currentTimezone = DateTime.local().zone.name;
    assert.strictEqual(
      component.timezoneEditor.currentTimezone.text,
      timezoneService.formatTimezone(currentTimezone)
    );
  });

  test('save date with new timezone', async function (assert) {
    assert.expect(8);
    const newTimezone = 'Pacific/Midway';
    const currentTimezone = DateTime.local().zone.name;
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
      assert.strictEqual(
        DateTime.fromJSDate(startDate).toUTC().toISO(),
        '2005-06-25T05:24:00.000Z'
      );
      assert.strictEqual(DateTime.fromJSDate(endDate).toUTC().toISO(), '2005-06-25T06:24:00.000Z');
    });
    const timezoneService = this.owner.lookup('service:timezone');
    await render(
      hbs`<OfferingForm @offering={{this.offering}} @close={{(noop)}} @save={{this.save}} />`
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
      timezoneService.formatTimezone(newTimezone)
    );
    await component.save();
  });

  test('removes double https from start of URL when input', async function (assert) {
    await render(hbs`<OfferingForm @close={{(noop)}} @showRoom={{true}} />`);
    await component.url.set('https://http://example.com');
    assert.strictEqual(component.url.value, 'http://example.com');
    await component.url.set('https://https://example.edu');
    assert.strictEqual(component.url.value, 'https://example.edu');
  });

  test('trims whitespace from URL input #1500', async function (assert) {
    await render(hbs`<OfferingForm @close={{(noop)}} @showRoom={{true}} />`);
    await component.url.set('  http://example.com  ');
    assert.strictEqual(component.url.value, 'http://example.com');
  });

  todo('rejects query param with trailing slash ilios/ilios#3050', async function (assert) {
    await render(hbs`<OfferingForm @close={{(noop)}} @showRoom={{true}} />`);
    assert.notOk(component.url.hasError);
    await component.url.set('http://example.com?jayden=awesome/');
    assert.ok(component.url.hasError);
  });

  test('learner groups sort order', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('programYear', { program });
    const cohort = this.server.create('cohort', { programYear });
    this.server.create('learnerGroup', { cohort, title: 'Learner Group 1' });
    this.server.create('learnerGroup', { cohort, title: 'Learner Group 10' });
    this.server.create('learnerGroup', { cohort, title: 'Learner Group 2' });

    const cohortModel = await this.owner.lookup('service:store').findRecord('cohort', cohort.id);
    this.set('cohorts', [cohortModel]);
    await render(hbs`<OfferingForm @cohorts={{this.cohorts}} @close={{(noop)}} />`);

    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .title,
      'Learner Group 1'
    );
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[1]
        .title,
      'Learner Group 2'
    );
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[2]
        .title,
      'Learner Group 10'
    );
  });

  test('save by pressing enter in duration hours field', async function (assert) {
    assert.expect(1);
    const offering = this.server.create('offering');
    const offeringModel = await this.owner
      .lookup('service:store')
      .findRecord('offering', offering.id);
    this.set('offering', offeringModel);
    this.set('save', () => {
      assert.ok(true);
    });
    await render(
      hbs`<OfferingForm @offering={{this.offering}} @close={{(noop)}} @save={{this.save}} />`
    );
    await component.duration.hours.submit();
  });

  test('save by pressing enter in duration minutes field', async function (assert) {
    assert.expect(1);
    const offering = this.server.create('offering');
    const offeringModel = await this.owner
      .lookup('service:store')
      .findRecord('offering', offering.id);
    this.set('offering', offeringModel);
    this.set('save', () => {
      assert.ok(true);
    });
    await render(
      hbs`<OfferingForm @offering={{this.offering}} @close={{(noop)}} @save={{this.save}} />`
    );
    await component.duration.minutes.submit();
  });

  test('save by pressing enter in location field', async function (assert) {
    assert.expect(1);
    const offering = this.server.create('offering');
    const offeringModel = await this.owner
      .lookup('service:store')
      .findRecord('offering', offering.id);
    this.set('offering', offeringModel);
    this.set('save', () => {
      assert.ok(true);
    });
    await render(hbs`<OfferingForm
      @offering={{this.offering}}
      @close={{(noop)}}
      @showRoom={{true}}
      @save={{this.save}}
    />`);
    await component.location.submit();
  });

  test('save by pressing enter in url field', async function (assert) {
    assert.expect(1);
    const offering = this.server.create('offering');
    const offeringModel = await this.owner
      .lookup('service:store')
      .findRecord('offering', offering.id);
    this.set('offering', offeringModel);
    this.set('save', () => {
      assert.ok(true);
    });
    await render(hbs`<OfferingForm
      @offering={{this.offering}}
      @close={{(noop)}}
      @showRoom={{true}}
      @save={{this.save}}
    />`);
    await component.url.submit();
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
    await render(hbs`<OfferingForm
      @offering={{this.offering}}
      @cohorts = {{this.cohorts}}
      @close={{(noop)}}
      @save={{(noop)}}
    />`);
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.selectedLearnerGroups
        .detailLearnergroupsList.trees[0].items.length,
      3
    );
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts.length,
      1
    );
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees.length,
      3
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .isChecked
    );
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups.length,
      2
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[0].isChecked
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[1].isChecked
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[1]
        .isChecked
    );
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[1]
        .subgroups.length,
      1
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[1]
        .subgroups[0].isChecked
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[2]
        .isChecked
    );
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[2]
        .subgroups.length,
      0
    );
    await component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups[0].toggle();
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.selectedLearnerGroups
        .detailLearnergroupsList.trees[0].items.length,
      2
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[0].isChecked
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
    await render(hbs`<OfferingForm
      @offering={{this.offering}}
      @cohorts = {{this.cohorts}}
      @close={{(noop)}}
      @save={{(noop)}}
    />`);
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.selectedLearnerGroups
        .detailLearnergroupsList.trees[0].items.length,
      3
    );
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts.length,
      1
    );
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees.length,
      3
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .isChecked
    );
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups.length,
      2
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[0].isChecked
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[1].isChecked
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[1]
        .isChecked
    );
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[1]
        .subgroups.length,
      1
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[1]
        .subgroups[0].isChecked
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[2]
        .isChecked
    );
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[2]
        .subgroups.length,
      0
    );
    await component.learnerManager.learnergroupSelectionManager.selectedLearnerGroups.detailLearnergroupsList.trees[0].items[0].remove();
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.selectedLearnerGroups
        .detailLearnergroupsList.trees[0].items.length,
      2
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[0].isChecked
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
    await render(hbs`<OfferingForm
      @offering={{this.offering}}
      @cohorts = {{this.cohorts}}
      @close={{(noop)}}
      @save={{(noop)}}
    />`);
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.selectedLearnerGroups
        .detailLearnergroupsList.trees[0].items.length,
      3
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[1]
        .subgroups[0].isChecked
    );
    await component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[1].subgroups[0].toggle();
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.selectedLearnerGroups
        .detailLearnergroupsList.trees[0].items.length,
      4
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[1]
        .subgroups[0].isChecked
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
    await render(hbs`<OfferingForm
      @offering={{this.offering}}
      @cohorts = {{this.cohorts}}
      @close={{(noop)}}
      @save={{(noop)}}
    />`);
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.selectedLearnerGroups
        .detailLearnergroupsList.trees[0].items.length,
      3
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[1]
        .isChecked
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[1]
        .subgroups[0].isChecked
    );
    await component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[1].toggle();
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.selectedLearnerGroups
        .detailLearnergroupsList.trees[0].items.length,
      5
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[1]
        .isChecked
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[1]
        .subgroups[0].isChecked
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
    await render(hbs`<OfferingForm
      @offering={{this.offering}}
      @cohorts = {{this.cohorts}}
      @close={{(noop)}}
      @save={{(noop)}}
    />`);
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.selectedLearnerGroups
        .detailLearnergroupsList.trees[0].items.length,
      3
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .isChecked
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[0].isChecked
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[1].isChecked
    );
    await component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].toggle();
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.selectedLearnerGroups
        .detailLearnergroupsList.trees[0].items.length,
      0
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .isChecked
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[0].isChecked
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[1].isChecked
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
    await render(hbs`<OfferingForm
      @offering={{this.offering}}
      @cohorts = {{this.cohorts}}
      @close={{(noop)}}
      @save={{(noop)}}
    />`);
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.selectedLearnerGroups
        .detailLearnergroupsList.trees[0].items.length,
      3
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .isChecked
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[0].isChecked
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[1].isChecked
    );
    await component.learnerManager.learnergroupSelectionManager.selectedLearnerGroups.detailLearnergroupsList.trees[0].items[0].remove();
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.selectedLearnerGroups
        .detailLearnergroupsList.trees[0].items.length,
      0
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .isChecked
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[0].isChecked
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[1].isChecked
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
    await render(hbs`<OfferingForm
      @offering={{this.offering}}
      @cohorts = {{this.cohorts}}
      @close={{(noop)}}
      @save={{(noop)}}
    />`);
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.selectedLearnerGroups
        .detailLearnergroupsList.trees[0].items.length,
      0
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .isChecked
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[0].isChecked
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[0].isChecked
    );
    await click('[data-test-learnergroup-tree-root=true] > [data-test-checkbox]', {
      shiftKey: true,
    });
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.selectedLearnerGroups
        .detailLearnergroupsList.trees[0].items.length,
      1
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .isChecked
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[0].isChecked
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[1].isChecked
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
    await render(hbs`<OfferingForm
      @offering={{this.offering}}
      @cohorts = {{this.cohorts}}
      @close={{(noop)}}
      @save={{(noop)}}
    />`);
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.selectedLearnerGroups
        .detailLearnergroupsList.trees[0].items.length,
      3
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .isChecked
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[0].isChecked
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[0].isChecked
    );
    await click('[data-test-learnergroup-tree-root=true] > [data-test-checkbox]', {
      shiftKey: true,
    });
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.selectedLearnerGroups
        .detailLearnergroupsList.trees[0].items.length,
      2
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .isChecked
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[0].isChecked
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[1].isChecked
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
    await render(hbs`<OfferingForm
      @offering={{this.offering}}
      @cohorts = {{this.cohorts}}
      @close={{(noop)}}
      @save={{(noop)}}
    />`);
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.selectedLearnerGroups
        .detailLearnergroupsList.trees[0].items.length,
      3
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .isChecked
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[0].isChecked
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[0].isChecked
    );
    await click('[data-test-remove-learnergroup]', { at: 0, shiftKey: true });
    assert.strictEqual(
      component.learnerManager.learnergroupSelectionManager.selectedLearnerGroups
        .detailLearnergroupsList.trees[0].items.length,
      2
    );
    assert.notOk(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .isChecked
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[0].isChecked
    );
    assert.ok(
      component.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0]
        .subgroups[1].isChecked
    );
  });
});
