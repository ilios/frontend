import moment from 'moment';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import page from 'ilios-common/page-objects/session';

module('Acceptance | Session - Offerings', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('programYear', { program });
    const cohort = this.server.create('cohort', { programYear });
    const course = this.server.create('course', {
      cohorts: [cohort],
      school: this.school,
      directors: [this.user],
    });
    this.server.create('sessionType', {
      school: this.school,
    });
    const users = this.server.createList('user', 8);
    const instructorGroup1 = this.server.create('instructor-group', {
      users: [users[0], users[1], users[4], users[5]],
      school: this.school,
    });
    const instructorGroup2 = this.server.create('instructor-group', {
      users: [users[2], users[3]],
      school: this.school,
    });
    const learnerGroup1 = this.server.create('learner-group', {
      users: [users[0], users[1]],
      cohort,
      location: 'default 1',
      instructors: [this.user],
      url: 'https://iliosproject.org/',
    });
    const learnerGroup2 = this.server.create('learner-group', {
      users: [users[2], users[3]],
      cohort,
      location: 'default 2',
      instructorGroups: [instructorGroup1],
    });
    const session = this.server.create('session', { course });

    this.today = moment().hour(9);
    this.offering1 = this.server.create('offering', {
      session,
      instructors: [users[4], users[5], users[6], users[7]],
      instructorGroups: [instructorGroup1, instructorGroup2],
      learnerGroups: [learnerGroup1, learnerGroup2],
      startDate: this.today.format(),
      endDate: this.today.clone().add(1, 'hour').format(),
      url: 'https://ucsf.edu/',
    });

    this.offering2 = this.server.create('offering', {
      session,
      instructors: [users[6], users[7]],
      instructorGroups: [instructorGroup2],
      learnerGroups: [learnerGroup2],
      startDate: this.today.clone().add(1, 'day').format(),
      endDate: this.today.clone().add(1, 'day').add(1, 'hour').format(),
    });
    this.offering3 = this.server.create('offering', {
      session,
      instructorGroups: [instructorGroup2],
      learnerGroups: [learnerGroup2],
      instructors: [],
      startDate: this.today.clone().add(2, 'days').format(),
      endDate: this.today.clone().add(3, 'days').add(1, 'hour').format(),
      url: 'https://example.edu/',
    });
  });

  test('basics', async function (assert) {
    assert.expect(2);
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.strictEqual(page.details.offerings.header.title, 'Offerings (3)');
    assert.strictEqual(page.details.offerings.dateBlocks.length, 3);
  });

  test('offering dates', async function (assert) {
    await page.visit({ courseId: 1, sessionId: 1 });

    const blocks = page.details.offerings.dateBlocks;
    assert.ok(blocks[0].hasStartTime);
    assert.ok(blocks[0].hasEndTime);
    assert.notOk(blocks[0].hasMultiDay);
    assert.strictEqual(blocks[0].dayOfWeek, moment(this.offering1.startDate).format('dddd'));
    assert.strictEqual(blocks[0].dayOfMonth, moment(this.offering1.startDate).format('MMMM Do'));
    assert.strictEqual(
      blocks[0].startTime,
      'Starts: ' + moment(this.offering1.startDate).format('LT')
    );
    assert.strictEqual(blocks[0].endTime, 'Ends: ' + moment(this.offering1.endDate).format('LT'));
    assert.strictEqual(blocks[0].offerings.length, 1);

    assert.ok(blocks[1].hasStartTime);
    assert.ok(blocks[1].hasEndTime);
    assert.strictEqual(blocks[1].dayOfWeek, moment(this.offering2.startDate).format('dddd'));
    assert.strictEqual(blocks[1].dayOfMonth, moment(this.offering2.startDate).format('MMMM Do'));
    assert.strictEqual(
      blocks[1].startTime,
      'Starts: ' + moment(this.offering2.startDate).format('LT')
    );
    assert.strictEqual(blocks[1].endTime, 'Ends: ' + moment(this.offering2.endDate).format('LT'));
    assert.strictEqual(blocks[1].offerings.length, 1);

    assert.notOk(blocks[2].hasStartTime);
    assert.notOk(blocks[2].hasEndTime);
    assert.strictEqual(blocks[2].dayOfWeek, moment(this.offering3.startDate).format('dddd'));
    assert.strictEqual(blocks[2].dayOfMonth, moment(this.offering3.startDate).format('MMMM Do'));
    assert.strictEqual(blocks[2].offerings.length, 1);
    assert.strictEqual(
      blocks[2].multiDayStart,
      'Starts: ' + moment(this.offering3.startDate).format('dddd MMMM Do [@] LT')
    );
    assert.strictEqual(
      blocks[2].multiDayEnd,
      'Ends: ' + moment(this.offering3.endDate).format('dddd MMMM Do [@] LT')
    );
  });

  test('offering details', async function (assert) {
    await page.visit({ courseId: 1, sessionId: 1 });
    const blocks = page.details.offerings.dateBlocks;
    assert.strictEqual(blocks[0].offerings[0].learnerGroups.length, 2);
    assert.strictEqual(blocks[0].offerings[0].learnerGroups[0].title, 'learner group 0');
    assert.strictEqual(blocks[0].offerings[0].learnerGroups[1].title, 'learner group 1');
    assert.strictEqual(blocks[0].offerings[0].location, this.offering1.room);
    assert.strictEqual(blocks[0].offerings[0].url, this.offering1.url);
    assert.strictEqual(blocks[0].offerings[0].instructors.length, 8);
    assert.strictEqual(
      blocks[0].offerings[0].instructors[0].userNameInfo.fullName,
      '1 guy M. Mc1son'
    );
    assert.strictEqual(
      blocks[0].offerings[0].instructors[1].userNameInfo.fullName,
      '2 guy M. Mc2son'
    );
    assert.strictEqual(
      blocks[0].offerings[0].instructors[2].userNameInfo.fullName,
      '3 guy M. Mc3son'
    );
    assert.strictEqual(
      blocks[0].offerings[0].instructors[3].userNameInfo.fullName,
      '4 guy M. Mc4son'
    );
    assert.strictEqual(
      blocks[0].offerings[0].instructors[4].userNameInfo.fullName,
      '5 guy M. Mc5son'
    );
    assert.strictEqual(
      blocks[0].offerings[0].instructors[5].userNameInfo.fullName,
      '6 guy M. Mc6son'
    );
    assert.strictEqual(
      blocks[0].offerings[0].instructors[6].userNameInfo.fullName,
      '7 guy M. Mc7son'
    );
    assert.strictEqual(
      blocks[0].offerings[0].instructors[7].userNameInfo.fullName,
      '8 guy M. Mc8son'
    );

    assert.strictEqual(blocks[1].offerings[0].learnerGroups.length, 1);
    assert.strictEqual(blocks[1].offerings[0].learnerGroups[0].title, 'learner group 1');
    assert.strictEqual(blocks[1].offerings[0].location, this.offering2.room);
    assert.strictEqual(blocks[1].offerings[0].instructors.length, 4);
    assert.strictEqual(
      blocks[1].offerings[0].instructors[0].userNameInfo.fullName,
      '3 guy M. Mc3son'
    );
    assert.strictEqual(
      blocks[1].offerings[0].instructors[1].userNameInfo.fullName,
      '4 guy M. Mc4son'
    );
    assert.strictEqual(
      blocks[1].offerings[0].instructors[2].userNameInfo.fullName,
      '7 guy M. Mc7son'
    );
    assert.strictEqual(
      blocks[1].offerings[0].instructors[3].userNameInfo.fullName,
      '8 guy M. Mc8son'
    );

    assert.strictEqual(blocks[2].offerings[0].learnerGroups.length, 1);
    assert.strictEqual(blocks[2].offerings[0].learnerGroups[0].title, 'learner group 1');
    assert.strictEqual(blocks[2].offerings[0].location, this.offering3.room);
    assert.strictEqual(blocks[2].offerings[0].url, this.offering3.url);
    assert.strictEqual(blocks[2].offerings[0].instructors.length, 2);
    assert.strictEqual(
      blocks[2].offerings[0].instructors[0].userNameInfo.fullName,
      '3 guy M. Mc3son'
    );
    assert.strictEqual(
      blocks[2].offerings[0].instructors[1].userNameInfo.fullName,
      '4 guy M. Mc4son'
    );
  });

  test('confirm removal message', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ courseId: 1, sessionId: 1 });
    await page.details.offerings.dateBlocks[0].offerings[0].remove();
    assert.ok(page.details.offerings.dateBlocks[0].offerings[0].hasRemoveConfirm);
    assert.strictEqual(
      page.details.offerings.dateBlocks[0].offerings[0].removeConfirmMessage,
      'Are you sure you want to delete this offering with 2 learner groups? This action cannot be undone. Yes Cancel'
    );
  });

  test('remove offering', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(2);
    await page.visit({ courseId: 1, sessionId: 1 });
    await page.details.offerings.dateBlocks[0].offerings[0].remove();
    await page.details.offerings.dateBlocks[0].offerings[0].confirmRemoval();
    assert.strictEqual(page.details.offerings.header.title, 'Offerings (2)');
    assert.strictEqual(page.details.offerings.dateBlocks.length, 2);
  });

  test('cancel remove offering', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(2);
    await page.visit({ courseId: 1, sessionId: 1 });
    await page.details.offerings.dateBlocks[0].offerings[0].remove();
    await page.details.offerings.dateBlocks[0].offerings[0].cancelRemoval();
    assert.strictEqual(page.details.offerings.header.title, 'Offerings (3)');
    assert.strictEqual(page.details.offerings.dateBlocks.length, 3);
  });

  test('users can create a new offering single day', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(14);
    await page.visit({ courseId: 1, sessionId: 1 });
    await page.details.offerings.header.createNew();
    const { offeringForm: form } = page.details.offerings;
    await page.details.offerings.singleOffering();
    await form.startDate.datePicker.set(new Date(2011, 8, 11));
    await form.startTime.timePicker.hour.select('2');
    await form.startTime.timePicker.minute.select('15');
    await form.startTime.timePicker.ampm.select('am');
    await form.duration.hours.set(15);
    await form.duration.minutes.set(15);
    await form.location.set('Rm. 111');

    await form.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].add();
    await form.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[1].add();
    await form.instructorSelectionManager.search.searchBox.set('guy');
    await form.instructorSelectionManager.search.results.items[0].click();
    await form.save();

    const block = page.details.offerings.dateBlocks[0];

    assert.ok(block.hasStartTime);
    assert.ok(block.hasEndTime);
    assert.notOk(block.hasMultiDay);
    assert.strictEqual(block.dayOfWeek, 'Sunday');
    assert.strictEqual(block.dayOfMonth, 'September 11th');
    assert.strictEqual(block.startTime, 'Starts: 2:15 AM');
    assert.strictEqual(block.endTime, 'Ends: 5:30 PM');
    assert.strictEqual(block.offerings.length, 1);

    assert.strictEqual(block.offerings[0].learnerGroups.length, 2);
    assert.strictEqual(block.offerings[0].learnerGroups[0].title, 'learner group 0');
    assert.strictEqual(block.offerings[0].learnerGroups[1].title, 'learner group 1');
    assert.strictEqual(block.offerings[0].location, 'Rm. 111');
    assert.strictEqual(block.offerings[0].instructors.length, 1);
    assert.strictEqual(block.offerings[0].instructors[0].userNameInfo.fullName, '0 guy M. Mc0son');
  });

  test('users can create a new offering multi-day', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(13);
    await page.visit({ courseId: 1, sessionId: 1 });
    await page.details.offerings.header.createNew();
    const { offeringForm: form } = page.details.offerings;
    await page.details.offerings.singleOffering();
    await form.startDate.datePicker.set(new Date(2011, 8, 11));
    await form.startTime.timePicker.hour.select('2');
    await form.startTime.timePicker.minute.select('15');
    await form.startTime.timePicker.ampm.select('am');
    await form.duration.hours.set(39);
    await form.duration.minutes.set(15);
    await form.location.set('Rm. 111');

    await form.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].add();
    await form.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[1].add();
    await form.instructorSelectionManager.search.searchBox.set('guy');
    await form.instructorSelectionManager.search.results.items[0].click();
    await form.save();

    const block = page.details.offerings.dateBlocks[0];

    assert.notOk(block.hasStartTime);
    assert.notOk(block.hasEndTime);
    assert.strictEqual(block.dayOfWeek, 'Sunday');
    assert.strictEqual(block.dayOfMonth, 'September 11th');
    assert.strictEqual(block.multiDayStart, 'Starts: Sunday September 11th @ 2:15 AM');
    assert.strictEqual(block.multiDayEnd, 'Ends: Monday September 12th @ 5:30 PM');
    assert.strictEqual(block.offerings.length, 1);

    assert.strictEqual(block.offerings[0].learnerGroups.length, 2);
    assert.strictEqual(block.offerings[0].learnerGroups[0].title, 'learner group 0');
    assert.strictEqual(block.offerings[0].learnerGroups[1].title, 'learner group 1');
    assert.strictEqual(block.offerings[0].location, 'Rm. 111');
    assert.strictEqual(block.offerings[0].instructors.length, 1);
    assert.strictEqual(block.offerings[0].instructors[0].userNameInfo.fullName, '0 guy M. Mc0son');
  });

  test('users can create a new small group offering', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(21);

    await page.visit({ courseId: 1, sessionId: 1 });
    await page.details.offerings.header.createNew();
    const { offeringForm: form } = page.details.offerings;
    await page.details.offerings.smallGroup();
    await form.startDate.datePicker.set(new Date(2011, 8, 11));
    await form.startTime.timePicker.hour.select('2');
    await form.startTime.timePicker.minute.select('15');
    await form.startTime.timePicker.ampm.select('am');
    await form.duration.hours.set(15);
    await form.duration.minutes.set(15);

    await form.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].add();
    await form.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[1].add();
    await form.save();

    const block = page.details.offerings.dateBlocks[0];

    assert.ok(block.hasStartTime);
    assert.ok(block.hasEndTime);
    assert.notOk(block.hasMultiDay);
    assert.strictEqual(block.dayOfWeek, 'Sunday');
    assert.strictEqual(block.dayOfMonth, 'September 11th');
    assert.strictEqual(block.startTime, 'Starts: 2:15 AM');
    assert.strictEqual(block.endTime, 'Ends: 5:30 PM');
    assert.strictEqual(block.offerings.length, 2);

    assert.strictEqual(block.offerings[0].learnerGroups.length, 1);
    assert.strictEqual(block.offerings[0].learnerGroups[0].title, 'learner group 0');
    assert.strictEqual(block.offerings[0].instructors.length, 1);
    assert.strictEqual(block.offerings[0].instructors[0].userNameInfo.fullName, '0 guy M. Mc0son');
    assert.strictEqual(block.offerings[0].url, 'https://iliosproject.org/');

    assert.strictEqual(block.offerings[1].learnerGroups.length, 1);
    assert.strictEqual(block.offerings[1].learnerGroups[0].title, 'learner group 1');
    assert.strictEqual(block.offerings[1].instructors.length, 4);
    assert.strictEqual(block.offerings[1].instructors[0].userNameInfo.fullName, '1 guy M. Mc1son');
    assert.strictEqual(block.offerings[1].instructors[1].userNameInfo.fullName, '2 guy M. Mc2son');
    assert.strictEqual(block.offerings[1].instructors[2].userNameInfo.fullName, '5 guy M. Mc5son');
    assert.strictEqual(block.offerings[1].instructors[3].userNameInfo.fullName, '6 guy M. Mc6son');
    assert.notOk(block.offerings[1].hasUrl);
  });

  test('users can edit existing offerings', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(18);

    await page.visit({ courseId: 1, sessionId: 1 });
    await page.details.offerings.dateBlocks[0].offerings[0].edit();

    const { offeringForm: form } = page.details.offerings.dateBlocks[0].offerings[0];

    await form.startDate.datePicker.set(new Date(2011, 9, 5));
    await form.startTime.timePicker.hour.select('11');
    await form.startTime.timePicker.minute.select('45');
    await form.startTime.timePicker.ampm.select('am');
    await form.duration.hours.set(6);
    await form.duration.minutes.set(10);
    await form.location.set('Rm. 111');
    await form.url.set('https://example.org');

    await form.learnerManager.learnergroupSelectionManager.selectedLearnerGroups.detailLearnergroupsList.trees[0].removeAllSubgroups();
    await form.instructorSelectionManager.selectedInstructors.instructors[0].remove();
    await form.instructorSelectionManager.selectedInstructorGroups.instructorGroups[0].remove();

    await form.save();

    const block = page.details.offerings.dateBlocks[0];

    assert.ok(block.hasStartTime);
    assert.ok(block.hasEndTime);
    assert.notOk(block.hasMultiDay);
    assert.strictEqual(block.dayOfWeek, 'Wednesday');
    assert.strictEqual(block.dayOfMonth, 'October 5th');
    assert.strictEqual(block.startTime, 'Starts: 11:45 AM');
    assert.strictEqual(block.endTime, 'Ends: 5:55 PM');
    assert.strictEqual(block.offerings.length, 1);

    const offering = block.offerings[0];

    assert.strictEqual(offering.learnerGroups.length, 1);
    assert.strictEqual(offering.learnerGroups[0].title, 'learner group 1');
    assert.strictEqual(offering.instructors.length, 5);
    assert.strictEqual(offering.instructors[0].userNameInfo.fullName, '3 guy M. Mc3son');
    assert.strictEqual(offering.instructors[1].userNameInfo.fullName, '4 guy M. Mc4son');
    assert.strictEqual(offering.instructors[2].userNameInfo.fullName, '6 guy M. Mc6son');
    assert.strictEqual(offering.instructors[3].userNameInfo.fullName, '7 guy M. Mc7son');
    assert.strictEqual(offering.instructors[4].userNameInfo.fullName, '8 guy M. Mc8son');
    assert.strictEqual(offering.location, 'Rm. 111');
    assert.strictEqual(offering.url, 'https://example.org/');
  });

  test('users can create recurring small groups', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(77);

    await page.visit({ courseId: 1, sessionId: 1 });
    await page.details.offerings.header.createNew();
    const { offeringForm: form } = page.details.offerings;
    await page.details.offerings.smallGroup();
    await form.startDate.datePicker.set(new Date(2015, 4, 22));
    await form.startTime.timePicker.hour.select('2');
    await form.startTime.timePicker.minute.select('15');
    await form.startTime.timePicker.ampm.select('am');
    await form.duration.hours.set(13);
    await form.duration.minutes.set(8);

    await form.recurring.yesNoToggle.click();
    await form.recurring.setWeeks(4);

    await form.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].add();
    await form.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[1].add();

    await form.save();

    assert.strictEqual(page.details.offerings.dateBlocks.length, 7);
    assert.strictEqual(page.details.offerings.dateBlocks[0].dayOfMonth, 'May 22nd');
    assert.strictEqual(page.details.offerings.dateBlocks[1].dayOfMonth, 'May 29th');
    assert.strictEqual(page.details.offerings.dateBlocks[2].dayOfMonth, 'June 5th');
    assert.strictEqual(page.details.offerings.dateBlocks[3].dayOfMonth, 'June 12th');

    for (let i = 0; i < 4; i++) {
      const block = page.details.offerings.dateBlocks[i];
      assert.ok(block.hasStartTime);
      assert.ok(block.hasEndTime);
      assert.notOk(block.hasMultiDay);
      assert.strictEqual(block.dayOfWeek, 'Friday');
      assert.strictEqual(block.startTime, 'Starts: 2:15 AM');
      assert.strictEqual(block.endTime, 'Ends: 3:23 PM');
      assert.strictEqual(block.offerings.length, 2);
      assert.strictEqual(block.offerings[0].learnerGroups.length, 1);
      assert.strictEqual(block.offerings[0].learnerGroups[0].title, 'learner group 0');

      assert.strictEqual(block.offerings[0].instructors.length, 1);
      assert.strictEqual(
        block.offerings[0].instructors[0].userNameInfo.fullName,
        '0 guy M. Mc0son'
      );

      assert.strictEqual(block.offerings[1].learnerGroups.length, 1);
      assert.strictEqual(block.offerings[1].learnerGroups[0].title, 'learner group 1');
      assert.strictEqual(block.offerings[1].instructors.length, 4);
      assert.strictEqual(
        block.offerings[1].instructors[0].userNameInfo.fullName,
        '1 guy M. Mc1son'
      );
      assert.strictEqual(
        block.offerings[1].instructors[1].userNameInfo.fullName,
        '2 guy M. Mc2son'
      );
      assert.strictEqual(
        block.offerings[1].instructors[2].userNameInfo.fullName,
        '5 guy M. Mc5son'
      );
      assert.strictEqual(
        block.offerings[1].instructors[3].userNameInfo.fullName,
        '6 guy M. Mc6son'
      );
    }
  });

  test('users can create recurring single offerings', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(57);

    await page.visit({ courseId: 1, sessionId: 1 });
    await page.details.offerings.header.createNew();
    const { offeringForm: form } = page.details.offerings;
    await page.details.offerings.singleOffering();
    await form.startDate.datePicker.set(new Date(2015, 4, 22));
    await form.startTime.timePicker.hour.select('2');
    await form.startTime.timePicker.minute.select('15');
    await form.startTime.timePicker.ampm.select('am');
    await form.duration.hours.set(13);
    await form.duration.minutes.set(8);
    await form.location.set('Scottsdale Stadium');
    await form.url.set('https://zoom.example.edu');

    await form.recurring.yesNoToggle.click();
    await form.recurring.setWeeks(4);

    await form.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].add();
    await form.learnerManager.learnergroupSelectionManager.availableGroups.cohorts[0].trees[1].add();

    await form.save();

    assert.strictEqual(page.details.offerings.dateBlocks.length, 7);
    assert.strictEqual(page.details.offerings.dateBlocks[0].dayOfMonth, 'May 22nd');
    assert.strictEqual(page.details.offerings.dateBlocks[1].dayOfMonth, 'May 29th');
    assert.strictEqual(page.details.offerings.dateBlocks[2].dayOfMonth, 'June 5th');
    assert.strictEqual(page.details.offerings.dateBlocks[3].dayOfMonth, 'June 12th');

    for (let i = 0; i < 4; i++) {
      const block = page.details.offerings.dateBlocks[i];
      assert.ok(block.hasStartTime);
      assert.ok(block.hasEndTime);
      assert.notOk(block.hasMultiDay);
      assert.strictEqual(block.dayOfWeek, 'Friday');
      assert.strictEqual(block.startTime, 'Starts: 2:15 AM');
      assert.strictEqual(block.endTime, 'Ends: 3:23 PM');
      assert.strictEqual(block.offerings.length, 1);
      assert.strictEqual(block.offerings[0].learnerGroups.length, 2);
      assert.strictEqual(block.offerings[0].location, 'Scottsdale Stadium');
      assert.strictEqual(block.offerings[0].url, 'https://zoom.example.edu/');
      assert.strictEqual(block.offerings[0].learnerGroups[0].title, 'learner group 0');
      assert.strictEqual(block.offerings[0].learnerGroups[1].title, 'learner group 1');

      assert.strictEqual(block.offerings[0].instructors.length, 0);
    }
  });

  test('edit offerings twice #2850', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(2);
    this.server.create('learnerGroup', {
      cohortId: 1,
    });
    this.server.create('learnerGroup', {
      cohortId: 1,
      parentId: 3,
    });
    this.server.create('learnerGroup', {
      cohortId: 1,
      parentId: 4,
    });
    this.server.create('learnerGroup', {
      cohortId: 1,
      parentId: 5,
    });
    this.server.db.cohorts.update(1, { learnerGroupIds: [3, 4, 5, 6] });

    await page.visit({ courseId: 1, sessionId: 1 });
    await page.details.offerings.dateBlocks[0].offerings[0].edit();
    await page.details.offerings.dateBlocks[0].offerings[0].offeringForm.save();
    assert.strictEqual(page.details.offerings.dateBlocks[0].offerings[0].location, 'room 0');

    await page.details.offerings.dateBlocks[0].offerings[0].edit();
    await page.details.offerings.dateBlocks[0].offerings[0].offeringForm.save();
    assert.strictEqual(page.details.offerings.dateBlocks[0].offerings[0].location, 'room 0');
  });
});
