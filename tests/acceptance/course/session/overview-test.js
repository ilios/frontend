import { currentRouteName } from '@ember/test-helpers';
import moment from 'moment';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';

import { setupApplicationTest } from 'dummy/tests/helpers';
import { enableFeature } from 'ember-feature-flags/test-support';
import page from 'ilios-common/page-objects/session';

module('Acceptance | Session - Overview', function (hooks) {
  setupApplicationTest(hooks);
  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.server.create('academicYear');
    this.course = this.server.create('course', {
      school: this.school,
    });
    this.sessionTypes = this.server.createList('sessionType', 2, {
      school: this.school,
    });
  });

  test('check fields', async function (assert) {
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    const session = this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
      instructionalNotes: 'session notes',
    });
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.strictEqual(page.details.overview.sessionType.value, 'session type 0');
    assert.strictEqual(page.details.overview.sessionDescription.value, session.description);
    assert.strictEqual(page.details.overview.instructionalNotes.value, 'session notes');
    assert.notOk(page.details.overview.ilmHours.isVisible);
  });

  test('check remove ilm', async function (assert) {
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    const ilmSession = this.server.create('ilmSession');
    this.server.create('session', {
      course: this.course,
      ilmSession,
    });
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.strictEqual(currentRouteName(), 'session.index');
    assert.ok(page.details.overview.ilmHours.isVisible);
    assert.ok(page.details.overview.ilmDueDateAndTime.isVisible);
    assert.strictEqual(parseInt(page.details.overview.ilmHours.value, 10), ilmSession.hours);
    assert.strictEqual(
      page.details.overview.ilmDueDateAndTime.value,
      new Date(ilmSession.dueDate).toLocaleDateString('en', {
        month: 'numeric',
        day: 'numeric',
        year: '2-digit',
        hour12: true,
        hour: 'numeric',
        minute: 'numeric',
      })
    );

    await page.details.overview.toggleIlm.yesNoToggle.click();

    assert.notOk(page.details.overview.ilmHours.isVisible);
    assert.notOk(page.details.overview.ilmDueDateAndTime.isVisible);
  });

  test('check add ilm', async function (assert) {
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    this.server.create('session', {
      course: this.course,
    });
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.strictEqual(currentRouteName(), 'session.index');
    assert.notOk(page.details.overview.ilmHours.isVisible);
    assert.notOk(page.details.overview.ilmDueDateAndTime.isVisible);

    await page.details.overview.toggleIlm.yesNoToggle.click();

    assert.ok(page.details.overview.ilmHours.isVisible);
    assert.ok(page.details.overview.ilmDueDateAndTime.isVisible);
    assert.strictEqual(parseInt(page.details.overview.ilmHours.value, 10), 1);
    assert.strictEqual(
      page.details.overview.ilmDueDateAndTime.value,
      moment().add(6, 'weeks').set('hour', 17).set('minute', 0).toDate().toLocaleDateString('en', {
        month: 'numeric',
        day: 'numeric',
        year: '2-digit',
        hour12: true,
        hour: 'numeric',
        minute: 'numeric',
      })
    );
  });

  test('change ilm hours', async function (assert) {
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    const ilmSession = this.server.create('ilmSession', {
      hours: 3,
    });
    this.server.create('session', {
      course: this.course,
      ilmSession,
    });
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.strictEqual(currentRouteName(), 'session.index');
    assert.strictEqual(parseInt(page.details.overview.ilmHours.value, 10), 3);
    await page.details.overview.ilmHours.edit();
    await page.details.overview.ilmHours.set(23);
    await page.details.overview.ilmHours.save();
    assert.strictEqual(parseInt(page.details.overview.ilmHours.value, 10), 23);
  });

  test('change ilm due date and time', async function (assert) {
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    const ilmSession = this.server.create('ilmSession', {
      hours: 3,
      dueDate: new Date(2021, 4, 18, 17, 0, 0),
    });
    this.server.create('session', {
      course: this.course,
      ilmSession,
    });
    const newDate = moment(ilmSession.dueDate).add(3, 'weeks').set('hour', 23).set('minute', 55);
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.strictEqual(currentRouteName(), 'session.index');
    assert.strictEqual(
      page.details.overview.ilmDueDateAndTime.value,
      new Date(ilmSession.dueDate).toLocaleDateString('en', {
        month: 'numeric',
        day: 'numeric',
        year: '2-digit',
        hour12: true,
        hour: 'numeric',
        minute: 'numeric',
      })
    );
    await page.details.overview.ilmDueDateAndTime.edit();
    await page.details.overview.ilmDueDateAndTime.datePicker.set(newDate.toDate());
    await page.details.overview.ilmDueDateAndTime.timePicker.hour.select(newDate.format('h'));
    await page.details.overview.ilmDueDateAndTime.timePicker.minute.select(newDate.minute());
    await page.details.overview.ilmDueDateAndTime.timePicker.ampm.select(newDate.format('a'));

    await page.details.overview.ilmDueDateAndTime.save();
    assert.strictEqual(
      page.details.overview.ilmDueDateAndTime.value,
      newDate.toDate().toLocaleDateString('en', {
        month: 'numeric',
        day: 'numeric',
        year: '2-digit',
        hour12: true,
        hour: 'numeric',
        minute: 'numeric',
      })
    );
  });

  test('change title', async function (assert) {
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    const session = this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
    });
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.strictEqual(currentRouteName(), 'session.index');
    assert.strictEqual(page.details.overview.title.value, session.title);
    await page.details.overview.title.edit();
    await page.details.overview.title.set('Rad Session Dude');
    await page.details.overview.title.save();
    assert.strictEqual(page.details.overview.title.value, 'Rad Session Dude');
  });

  test('last Updated', async function (assert) {
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
      updatedAt: moment('2019-07-09 17:00:00').toDate(),
    });
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.strictEqual(currentRouteName(), 'session.index');
    assert.strictEqual(
      page.details.overview.lastUpdated,
      'Last Update Last Update: 07/09/2019 5:00 PM'
    );
  });

  test('change type', async function (assert) {
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
    });
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.strictEqual(currentRouteName(), 'session.index');
    assert.strictEqual(page.details.overview.sessionType.value, 'session type 0');
    await page.details.overview.sessionType.edit();
    await page.details.overview.sessionType.set(2);
    await page.details.overview.sessionType.save();
    assert.strictEqual(page.details.overview.sessionType.value, 'session type 1');
  });

  test('session attributes are shown by school config', async function (assert) {
    assert.expect(5);
    await setupAuthentication({ school: this.school });
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
    });
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[1],
    });
    this.server.create('schoolConfig', {
      school: this.school,
      name: 'showSessionSupplemental',
      value: true,
    });
    this.server.create('schoolConfig', {
      school: this.school,
      name: 'showSessionSpecialAttireRequired',
      value: true,
    });
    this.server.create('schoolConfig', {
      school: this.school,
      name: 'showSessionSpecialEquipmentRequired',
      value: true,
    });
    this.server.create('schoolConfig', {
      school: this.school,
      name: 'showSessionAttendanceRequired',
      value: true,
    });
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.strictEqual(currentRouteName(), 'session.index');
    assert.ok(page.details.overview.supplemental.isVisible);
    assert.ok(page.details.overview.specialAttire.isVisible);
    assert.ok(page.details.overview.specialEquipment.isVisible);
    assert.ok(page.details.overview.attendanceRequired.isVisible);
  });

  test('session attributes are hidden by school config', async function (assert) {
    assert.expect(5);
    await setupAuthentication({ school: this.school });
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
    });
    this.server.create('schoolConfig', {
      school: this.school,
      name: 'showSessionSupplemental',
      value: false,
    });
    this.server.create('schoolConfig', {
      school: this.school,
      name: 'showSessionSpecialAttireRequired',
      value: false,
    });
    this.server.create('schoolConfig', {
      school: this.school,
      name: 'showSessionSpecialEquipmentRequired',
      value: false,
    });
    this.server.create('schoolConfig', {
      school: this.school,
      name: 'showSessionAttendanceRequired',
      value: false,
    });
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.strictEqual(currentRouteName(), 'session.index');
    assert.notOk(page.details.overview.supplemental.isVisible);
    assert.notOk(page.details.overview.specialAttire.isVisible);
    assert.notOk(page.details.overview.specialEquipment.isVisible);
    assert.notOk(page.details.overview.attendanceRequired.isVisible);
  });

  test('session attributes are hidden when there is no school config', async function (assert) {
    assert.expect(5);
    await setupAuthentication({ school: this.school });
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
    });
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.strictEqual(currentRouteName(), 'session.index');
    assert.notOk(page.details.overview.supplemental.isVisible);
    assert.notOk(page.details.overview.specialAttire.isVisible);
    assert.notOk(page.details.overview.specialEquipment.isVisible);
    assert.notOk(page.details.overview.attendanceRequired.isVisible);
  });

  test('change supplemental', async function (assert) {
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[1],
    });
    this.server.create('schoolConfig', {
      school: this.school,
      name: 'showSessionSupplemental',
      value: true,
    });
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.strictEqual(currentRouteName(), 'session.index');
    assert.ok(page.details.overview.supplemental.isVisible);
    assert.strictEqual(page.details.overview.supplemental.yesNoToggle.checked, 'false');
    await page.details.overview.supplemental.yesNoToggle.click();
    assert.strictEqual(page.details.overview.supplemental.yesNoToggle.checked, 'true');
  });

  test('change special attire', async function (assert) {
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[1],
    });
    this.server.create('schoolConfig', {
      school: this.school,
      name: 'showSessionSpecialAttireRequired',
      value: true,
    });
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.strictEqual(currentRouteName(), 'session.index');
    assert.ok(page.details.overview.specialAttire.isVisible);
    assert.strictEqual(page.details.overview.specialAttire.yesNoToggle.checked, 'false');
    await page.details.overview.specialAttire.yesNoToggle.click();
    assert.strictEqual(page.details.overview.specialAttire.yesNoToggle.checked, 'true');
  });

  test('change special equipment', async function (assert) {
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[1],
    });
    this.server.create('schoolConfig', {
      school: this.school,
      name: 'showSessionSpecialEquipmentRequired',
      value: true,
    });
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.strictEqual(currentRouteName(), 'session.index');
    assert.ok(page.details.overview.specialEquipment.isVisible);
    assert.strictEqual(page.details.overview.specialEquipment.yesNoToggle.checked, 'false');
    await page.details.overview.specialEquipment.yesNoToggle.click();
    assert.strictEqual(page.details.overview.specialEquipment.yesNoToggle.checked, 'true');
  });

  test('change attendance rquired', async function (assert) {
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[1],
    });
    this.server.create('schoolConfig', {
      school: this.school,
      name: 'showSessionAttendanceRequired',
      value: true,
    });
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.strictEqual(currentRouteName(), 'session.index');
    assert.ok(page.details.overview.attendanceRequired.isVisible);
    assert.strictEqual(page.details.overview.attendanceRequired.yesNoToggle.checked, 'false');
    await page.details.overview.attendanceRequired.yesNoToggle.click();
    assert.strictEqual(page.details.overview.attendanceRequired.yesNoToggle.checked, 'true');
  });

  test('change description', async function (assert) {
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    const session = this.server.create('session', {
      course: this.course,
    });
    const newDescription = 'some new thing';
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.strictEqual(currentRouteName(), 'session.index');
    assert.strictEqual(page.details.overview.sessionDescription.value, session.description);
    await page.details.overview.sessionDescription.edit();
    await page.details.overview.sessionDescription.set(newDescription);
    await page.details.overview.sessionDescription.save();
    assert.strictEqual(page.details.overview.sessionDescription.value, newDescription);
  });

  test('add description', async function (assert) {
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    this.server.create('session', {
      course: this.course,
      description: null,
    });
    const newDescription = 'some new thing';
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.strictEqual(currentRouteName(), 'session.index');
    assert.strictEqual(page.details.overview.sessionDescription.value, 'Click to edit');
    await page.details.overview.sessionDescription.edit();
    await page.details.overview.sessionDescription.set(newDescription);
    await page.details.overview.sessionDescription.save();
    assert.strictEqual(page.details.overview.sessionDescription.value, newDescription);
  });

  test('empty description removes description', async function (assert) {
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    this.server.create('session', {
      course: this.course,
      description: null,
    });
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.strictEqual(currentRouteName(), 'session.index');
    assert.strictEqual(page.details.overview.sessionDescription.value, 'Click to edit');
    await page.details.overview.sessionDescription.edit();
    await page.details.overview.sessionDescription.set('<p>&nbsp</p><div></div><span>  </span>');
    await page.details.overview.sessionDescription.save();
    assert.strictEqual(page.details.overview.sessionDescription.value, 'Click to edit');
  });

  test('remove description', async function (assert) {
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    const session = this.server.create('session', {
      course: this.course,
    });
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.strictEqual(currentRouteName(), 'session.index');
    assert.strictEqual(page.details.overview.sessionDescription.value, session.description);
    await page.details.overview.sessionDescription.edit();
    await page.details.overview.sessionDescription.set('<p>&nbsp</p><div></div><span>  </span>');
    await page.details.overview.sessionDescription.save();
    assert.strictEqual(page.details.overview.sessionDescription.value, 'Click to edit');
  });

  test('cancel editing empty description #3210', async function (assert) {
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    this.server.create('session', {
      course: this.course,
      description: null,
    });
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.strictEqual(currentRouteName(), 'session.index');
    assert.strictEqual(page.details.overview.sessionDescription.value, 'Click to edit');
    await page.details.overview.sessionDescription.edit();
    await page.details.overview.sessionDescription.set('something useless this way types');
    await page.details.overview.sessionDescription.cancel();
    assert.strictEqual(page.details.overview.sessionDescription.value, 'Click to edit');
  });

  test('click copy', async function (assert) {
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
    });

    await page.visit({ courseId: 1, sessionId: 1 });
    await page.details.overview.copy.visit();

    assert.strictEqual(currentRouteName(), 'session.copy');
  });

  test('copy hidden from unprivledged users', async function (assert) {
    await setupAuthentication({ school: this.school });
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
    });
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.strictEqual(currentRouteName(), 'session.index');
    assert.notOk(page.details.overview.copy.isVisible);
  });

  test('copy visible to privileged users', async function (assert) {
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
    });
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.strictEqual(currentRouteName(), 'session.index');
    assert.ok(page.details.overview.copy.isVisible);
  });

  test('copy hidden on copy route', async function (assert) {
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
    });
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.strictEqual(currentRouteName(), 'session.index');
    assert.ok(page.details.overview.copy.isVisible);
    await page.details.overview.copy.visit();
    assert.strictEqual(currentRouteName(), 'session.copy');
    assert.notOk(page.details.overview.copy.isVisible);
  });

  test('change instructionalNotes', async function (assert) {
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    this.server.create('session', {
      course: this.course,
      instructionalNotes: 'instructional note',
    });
    const newInstructionalNotes = 'some new thing';
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.strictEqual(currentRouteName(), 'session.index');
    assert.strictEqual(page.details.overview.instructionalNotes.value, 'instructional note');
    await page.details.overview.instructionalNotes.edit();
    await page.details.overview.instructionalNotes.set(newInstructionalNotes);
    await page.details.overview.instructionalNotes.save();
    assert.strictEqual(page.details.overview.instructionalNotes.value, newInstructionalNotes);
    assert.strictEqual(
      this.server.db.sessions[0].instructionalNotes,
      `<p>${newInstructionalNotes}</p>`
    );
  });

  test('add instructionalNotes', async function (assert) {
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    this.server.create('session', {
      course: this.course,
    });
    const newInstructionalNotes = 'some new thing';
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.strictEqual(currentRouteName(), 'session.index');
    assert.strictEqual(page.details.overview.instructionalNotes.value, 'Click to edit');
    await page.details.overview.instructionalNotes.edit();
    await page.details.overview.instructionalNotes.set(newInstructionalNotes);
    await page.details.overview.instructionalNotes.save();
    assert.strictEqual(page.details.overview.instructionalNotes.value, newInstructionalNotes);
    assert.strictEqual(
      this.server.db.sessions[0].instructionalNotes,
      `<p>${newInstructionalNotes}</p>`
    );
  });

  test('empty instructionalNotes removes instructionalNotes', async function (assert) {
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    this.server.create('session', {
      course: this.course,
    });
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.strictEqual(currentRouteName(), 'session.index');
    assert.strictEqual(page.details.overview.instructionalNotes.value, 'Click to edit');
    await page.details.overview.instructionalNotes.edit();
    await page.details.overview.instructionalNotes.set('<p>&nbsp</p><div></div><span>  </span>');
    await page.details.overview.instructionalNotes.save();
    assert.strictEqual(page.details.overview.instructionalNotes.value, 'Click to edit');
    assert.strictEqual(this.server.db.sessions[0].instructionalNotes, null);
  });

  test('remove instructionalNotes', async function (assert) {
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    this.server.create('session', {
      course: this.course,
      instructionalNotes: 'instructional note',
    });
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.strictEqual(currentRouteName(), 'session.index');
    assert.strictEqual(page.details.overview.instructionalNotes.value, 'instructional note');
    await page.details.overview.instructionalNotes.edit();
    await page.details.overview.instructionalNotes.set('<p>&nbsp</p><div></div><span>  </span>');
    await page.details.overview.instructionalNotes.save();
    assert.strictEqual(page.details.overview.instructionalNotes.value, 'Click to edit');
  });

  test('cancel editing empty instructionalNotes #3210', async function (assert) {
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    this.server.create('session', {
      course: this.course,
    });
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.strictEqual(currentRouteName(), 'session.index');
    assert.strictEqual(page.details.overview.instructionalNotes.value, 'Click to edit');
    await page.details.overview.instructionalNotes.edit();
    await page.details.overview.instructionalNotes.set('something useless this way types');
    await page.details.overview.instructionalNotes.cancel();
    assert.strictEqual(page.details.overview.instructionalNotes.value, 'Click to edit');
  });

  test('has no pre-requisite', async function (assert) {
    enableFeature('sessionLinkingAdminUi');
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    this.server.create('session', {
      course: this.course,
    });
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.strictEqual(page.details.overview.prerequisites.text, 'Prerequisites: None');
  });

  test('has pre-requisites', async function (assert) {
    enableFeature('sessionLinkingAdminUi');
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    const session = this.server.create('session', {
      course: this.course,
    });
    this.server.createList('session', 3, {
      course: this.course,
      postrequisite: session,
    });
    this.server.create('session', {
      course: this.course,
    });
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.strictEqual(
      page.details.overview.prerequisites.text,
      'Prerequisites: session 1, session 2, session 3'
    );
  });

  test('has no post-requisite', async function (assert) {
    enableFeature('sessionLinkingAdminUi');
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    const ilmSession = this.server.create('ilmSession');
    this.server.create('session', {
      course: this.course,
      ilmSession,
    });
    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionLearnergroupDetails: true,
    });
    assert.strictEqual(page.details.overview.postrequisite.text, 'Due prior to: None');
    assert.ok(page.details.overview.ilmDueDateAndTime.isVisible);
  });

  test('has post-requisite', async function (assert) {
    enableFeature('sessionLinkingAdminUi');
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    const ilmSession = this.server.create('ilmSession');
    const session = this.server.create('session', {
      course: this.course,
      ilmSession,
    });
    const postRequisite = this.server.create('session', {
      course: this.course,
    });
    session.update('postrequisite', postRequisite);
    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionLearnergroupDetails: true,
    });
    assert.strictEqual(page.details.overview.postrequisite.text, 'Due prior to: session 1');
    assert.notOk(page.details.overview.ilmDueDateAndTime.isVisible);
  });

  test('change post-requisite', async function (assert) {
    enableFeature('sessionLinkingAdminUi');
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    this.server.create('session', {
      course: this.course,
    });
    this.server.createList('session', 3, {
      course: this.course,
    });
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.strictEqual(page.details.overview.postrequisite.value, 'None');
    await page.details.overview.postrequisite.edit();
    await page.details.overview.postrequisite.editor.postRequisites[1].click();
    await page.details.overview.postrequisite.editor.save();
    assert.strictEqual(page.details.overview.postrequisite.value, 'session 2');
  });

  test('shows expanded objectives if no objectives exist', async function (assert) {
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    this.server.create('session', { course: this.course });
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.strictEqual(currentRouteName(), 'session.index');
    assert.notOk(page.details.collapsedObjectives.isPresent);
  });

  test('shows collapsed objectives if objectives exist', async function (assert) {
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    const session = this.server.create('session', { course: this.course });
    this.server.create('sessionObjective', { session });
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.strictEqual(currentRouteName(), 'session.index');
    assert.ok(page.details.collapsedObjectives.isPresent);
  });

  test('shows associated learner groups', async function (assert) {
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    const session = this.server.create('session', { course: this.course });
    const learnerGroups = this.server.createList('learner-group', 3);
    this.server.create('offering', { session, learnerGroups });
    this.server.create('offering', { session, learnerGroups });
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.strictEqual(currentRouteName(), 'session.index');
    assert.strictEqual(
      page.details.overview.associatedGroups.groups,
      'learner group 0, learner group 1, learner group 2'
    );
  });
});
