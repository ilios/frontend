import { module, test, todo } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { padStart } from 'ember-pad/utils/pad';
import moment from 'moment';
import { component } from 'ilios-common/page-objects/components/offering-form';

module('Integration | Component | offering form', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

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
    await component.location.set(padStart('a', 300, 'a'));
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
    const dayToday = moment().day();
    await component.recurring.yesNoToggle.click();
    assert.ok(component.recurring.weekdays[dayToday].input.isSelected);
    assert.ok(component.recurring.weekdays[dayToday].input.isDisabled);
  });

  test('instructor manager does not show by default', async function (assert) {
    await render(hbs`<OfferingForm @close={{(noop)}} />`);
    assert.notOk(component.instructorManager.isPresent);
  });

  test('instructor manager shows up when requested', async function (assert) {
    await render(hbs`<OfferingForm @close={{(noop)}} @showInstructors={{true}} />`);
    assert.ok(component.instructorManager.isPresent);
  });

  test('before course startDate default initial startDate falls on course start date', async function (assert) {
    const courseStartDate = moment().add(2, 'days');
    const courseEndDate = moment().add(4, 'days');
    this.set('courseStartDate', courseStartDate);
    this.set('courseEndDate', courseEndDate);
    await render(hbs`<OfferingForm
      @close={{(noop)}}
      @courseStartDate={{this.courseStartDate}}
      @courseEndDate={{this.courseEndDate}}
    />`);
    const selectedDate = new Date(component.startDate.datePicker.value);
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

  test('after course endDate default initial startDate falls on course end date', async function (assert) {
    const courseStartDate = moment().subtract(4, 'days');
    const courseEndDate = moment().subtract(2, 'days');
    this.set('courseStartDate', courseStartDate);
    this.set('courseEndDate', courseEndDate);
    await render(hbs`<OfferingForm
      @close={{(noop)}}
      @courseStartDate={{this.courseStartDate}}
      @courseEndDate={{this.courseEndDate}}
    />`);
    const selectedDate = new Date(component.startDate.datePicker.value);
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

  test('between course startDate and endDate default initial startDate falls on today', async function (assert) {
    const courseStartDate = moment().subtract(4, 'days');
    const courseEndDate = moment().add(4, 'days');
    const today = moment();
    this.set('courseStartDate', courseStartDate);
    this.set('courseEndDate', courseEndDate);
    await render(hbs`<OfferingForm
      @close={{(noop)}}
      @courseStartDate={{this.courseStartDate}}
      @courseEndDate={{this.courseEndDate}}
    />`);
    const selectedDate = new Date(component.startDate.datePicker.value);
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
        assert.equal(moment(startDate).format('YYYY-MM-DD'), moment().format('YYYY-MM-DD'));
        assert.equal(moment(endDate).format('YYYY-MM-DD'), moment().format('YYYY-MM-DD'));
        assert.equal(room, null);
        assert.equal(url, null);
        assert.equal(learnerGroups.length, 0);
        assert.equal(learners.length, 0);
        assert.equal(instructorGroups.length, 0);
        assert.equal(instructors.length, 0);
      }
    );
    await render(hbs`<OfferingForm @close={{(noop)}} @save={{this.save}} />`);
    await component.save();
  });

  test('save recurring one week with days selected before initial date', async function (assert) {
    assert.expect(4);
    const wednesday = moment().add(1, 'week').day(3);
    const thursday = wednesday.clone().add(1, 'day').day();
    const tuesday = wednesday.clone().subtract(1, 'day').day();
    const newStartDate = wednesday.toDate();
    let savedCount = 0;
    this.set('save', async (startDate) => {
      assert.ok(savedCount <= 1, 'should only get two saved offerings, we got ' + (savedCount + 1));
      let expectedStartDate;
      switch (savedCount) {
        case 0:
          expectedStartDate = wednesday.clone();
          break;
        case 1:
          expectedStartDate = wednesday.clone().day(thursday);
          break;
      }
      assert.equal(moment(startDate).format('YYYY-MM-DD'), expectedStartDate.format('YYYY-MM-DD'));

      savedCount++;
    });
    await render(hbs`<OfferingForm
      @close={{(noop)}}
      @showMakeRecurring={{true}}
      @save={{this.save}}
    />`);
    await component.recurring.yesNoToggle.click();
    await component.startDate.datePicker.set(newStartDate);
    await component.recurring.weekdays[tuesday].input.toggle();
    await component.recurring.weekdays[thursday].input.toggle();
    await component.save();
  });

  test('save recurring 3 weeks should get lots of days', async function (assert) {
    assert.expect(16);
    const wednesday = moment().add(1, 'week').day(3);
    const thursday = wednesday.clone().add(1, 'day').day();
    const tuesday = wednesday.clone().subtract(1, 'day').day();
    const newStartDate = wednesday.toDate();
    let savedCount = 0;
    this.set('save', async (startDate) => {
      assert.ok(
        savedCount <= 7,
        'should only get eight saved offerings, we got ' +
          (savedCount + 1) +
          ' with startDate ' +
          moment(startDate).format('YYYY-MM-DD')
      );
      let expectedStartDate;
      switch (savedCount) {
        case 0:
          expectedStartDate = wednesday.clone();
          break;
        case 1:
          expectedStartDate = wednesday.clone().add(1, 'day');
          break;
        case 2:
          expectedStartDate = wednesday.clone().subtract(1, 'day').add(1, 'weeks');
          break;
        case 3:
          expectedStartDate = wednesday.clone().add(1, 'weeks');
          break;
        case 4:
          expectedStartDate = wednesday.clone().add(1, 'day').add(1, 'weeks');
          break;
        case 5:
          expectedStartDate = wednesday.clone().subtract(1, 'day').add(2, 'weeks');
          break;
        case 6:
          expectedStartDate = wednesday.clone().add(2, 'weeks');
          break;
        case 7:
          expectedStartDate = wednesday.clone().add(1, 'day').add(2, 'weeks');
          break;
      }
      assert.equal(expectedStartDate.format('YYYY-MM-DD'), moment(startDate).format('YYYY-MM-DD'));

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
    await component.recurring.weekdays[tuesday].input.toggle();
    await component.recurring.weekdays[thursday].input.toggle();
    await component.save();
  });

  test('changing start date changes end date', async function (assert) {
    await render(hbs`<OfferingForm @close={{(noop)}} />`);
    const format = 'M/D/YYYY, h:mm A';
    const newStartDate = moment().add(1, 'day').toDate();
    assert.equal(moment().hour(9).minute(0).format(format), component.endDate.value);
    await component.startDate.datePicker.set(newStartDate);
    assert.equal(moment(newStartDate).hour(9).minute(0).format(format), component.endDate.value);
  });

  test('changing start time changes end date', async function (assert) {
    await render(hbs`<OfferingForm @close={{(noop)}} />`);
    const format = 'M/D/YYYY, h:mm A';
    assert.equal(moment().hour(9).minute(0).format(format), component.endDate.value);
    await component.startTime.timePicker.hour.select('2');
    await component.startTime.timePicker.minute.select('15');
    await component.startTime.timePicker.ampm.select('pm');
    assert.equal(moment().hour(15).minute(15).format(format), component.endDate.value);
  });

  test('changing duration changes end date', async function (assert) {
    await render(hbs`<OfferingForm @close={{(noop)}} />`);
    const format = 'M/D/YYYY, h:mm A';
    assert.equal(moment().hour(9).minute(0).format(format), component.endDate.value);
    await component.duration.hours.set('2');
    await component.duration.minutes.set('15');
    assert.equal(moment().hour(10).minute(15).format(format), component.endDate.value);
  });

  // @see https://github.com/ilios/frontend/issues/1903
  test('changing duration and start time changes end date', async function (assert) {
    await render(hbs`<OfferingForm @close={{(noop)}} />`);
    const format = 'M/D/YYYY, h:mm A';
    assert.equal(moment().hour(9).minute(0).format(format), component.endDate.value);
    await component.startTime.timePicker.hour.select('2');
    await component.startTime.timePicker.minute.select('10');
    await component.startTime.timePicker.ampm.select('pm');
    await component.duration.hours.set('2');
    await component.duration.minutes.set('50');
    assert.equal(moment().hour(17).minute(0).format(format), component.endDate.value);
  });

  test('learner manager is not present in small-group mode', async function (assert) {
    await render(hbs`<OfferingForm @close={{(noop)}} @smallGroupMode={{true}} />`);
    assert.notOk(component.learnerManager.selectedLearners.isPresent);
    assert.notOk(component.learnerManager.availableLearners.isPresent);
  });

  test('learner manager is present in single-offering mode', async function (assert) {
    await render(hbs`<OfferingForm @close={{(noop)}} @smallGroupMode={{false}} />`);
    assert.ok(component.learnerManager.selectedLearners.isPresent);
    assert.ok(component.learnerManager.availableLearners.isPresent);
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
      startDate: moment('2005-06-24').hour(18).minute(24).toDate(),
      endDate: moment('2005-06-24').hour(19).minute(24).toDate(),
    });
    const offeringModel = await this.owner.lookup('service:store').find('offering', offering.id);
    this.set('offering', offeringModel);
    await render(hbs`<OfferingForm
      @offering={{this.offering}}
      @close={{(noop)}}
      @showRoom={{true}}
      @showMakeRecurring={{true}}
      @showInstructors={{true}}
    />`);
    assert.equal(component.location.value, 'emerald bay');
    assert.equal(component.duration.hours.value, '1');
    assert.equal(component.duration.minutes.value, '0');
    const selectedDate = new Date(component.startDate.datePicker.value);
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

  test('shows current timezone', async function (assert) {
    await render(hbs`<OfferingForm @close={{(noop)}} />`);
    const timezoneService = this.owner.lookup('service:timezone');
    const currentTimezone = moment.tz.guess();
    assert.equal(
      component.timezoneEditor.currentTimezone.text,
      timezoneService.formatTimezone(currentTimezone)
    );
  });

  test('save date with new timezone', async function (assert) {
    assert.expect(8);
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
      assert.equal(moment(startDate).tz(utc).format('Y-MM-DD HH:mm'), '2005-06-25 05:24');
      assert.equal(moment(endDate).tz(utc).format('Y-MM-DD HH:mm'), '2005-06-25 06:24');
    });
    const timezoneService = this.owner.lookup('service:timezone');
    await render(
      hbs`<OfferingForm @offering={{this.offering}} @close={{(noop)}} @save={{this.save}} />`
    );
    assert.notEqual(newTimezone, currentTimezone);
    assert.notOk(component.timezoneEditor.picker.isPresent);
    await component.timezoneEditor.currentTimezone.edit();
    assert.ok(component.timezoneEditor.picker.isPresent);
    assert.equal(component.timezoneEditor.picker.value, currentTimezone);
    await component.timezoneEditor.picker.select(newTimezone);
    assert.notOk(component.timezoneEditor.picker.isPresent);
    assert.equal(
      component.timezoneEditor.currentTimezone.text,
      timezoneService.formatTimezone(newTimezone)
    );
    await component.save();
  });

  test('removes double https from start of URL when input', async function (assert) {
    await render(hbs`<OfferingForm @close={{(noop)}} @showRoom={{true}} />`);
    await component.url.set('https://http://example.com');
    assert.equal(component.url.value, 'http://example.com');
    await component.url.set('https://https://example.edu');
    assert.equal(component.url.value, 'https://example.edu');
  });

  test('trims whitespace from URL input #1500', async function (assert) {
    await render(hbs`<OfferingForm @close={{(noop)}} @showRoom={{true}} />`);
    await component.url.set('  http://example.com  ');
    assert.equal(component.url.value, 'http://example.com');
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

    const cohortModel = await this.owner.lookup('service:store').find('cohort', cohort.id);
    this.set('cohorts', [cohortModel]);
    await render(hbs`<OfferingForm @cohorts={{this.cohorts}} @close={{(noop)}} />`);

    assert.equal(
      component.learnerManager.availableLearnerGroups.cohorts[0].trees[0].title,
      'Learner Group 1'
    );
    assert.equal(
      component.learnerManager.availableLearnerGroups.cohorts[0].trees[1].title,
      'Learner Group 2'
    );
    assert.equal(
      component.learnerManager.availableLearnerGroups.cohorts[0].trees[2].title,
      'Learner Group 10'
    );
  });

  test('save by pressing enter in duration hours field', async function (assert) {
    assert.expect(1);
    const offering = this.server.create('offering');
    const offeringModel = await this.owner.lookup('service:store').find('offering', offering.id);
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
    const offeringModel = await this.owner.lookup('service:store').find('offering', offering.id);
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
    const offeringModel = await this.owner.lookup('service:store').find('offering', offering.id);
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
    const offeringModel = await this.owner.lookup('service:store').find('offering', offering.id);
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
});
