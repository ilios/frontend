import { currentRouteName } from '@ember/test-helpers';
import moment from 'moment';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';

import { setupApplicationTest } from 'ember-qunit';
import { enableFeature } from 'ember-feature-flags/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import page from 'ilios-common/page-objects/session';

module('Acceptance | Session - Overview', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
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
    assert.strictEqual(page.overview.sessionType.value, 'session type 0');
    assert.strictEqual(page.overview.sessionDescription.value, session.description);
    assert.strictEqual(page.overview.instructionalNotes.value, 'session notes');
    assert.notOk(page.overview.ilmHours.isVisible);
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
    assert.ok(page.overview.ilmHours.isVisible);
    assert.ok(page.overview.ilmDueDateAndTime.isVisible);
    assert.strictEqual(parseInt(page.overview.ilmHours.value, 10), ilmSession.hours);
    assert.strictEqual(
      page.overview.ilmDueDateAndTime.value,
      new Date(ilmSession.dueDate).toLocaleDateString('en', {
        month: 'numeric',
        day: 'numeric',
        year: '2-digit',
        hour12: true,
        hour: 'numeric',
        minute: 'numeric',
      })
    );

    await page.overview.toggleIlm.yesNoToggle.click();

    assert.notOk(page.overview.ilmHours.isVisible);
    assert.notOk(page.overview.ilmDueDateAndTime.isVisible);
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
    assert.notOk(page.overview.ilmHours.isVisible);
    assert.notOk(page.overview.ilmDueDateAndTime.isVisible);

    await page.overview.toggleIlm.yesNoToggle.click();

    assert.ok(page.overview.ilmHours.isVisible);
    assert.ok(page.overview.ilmDueDateAndTime.isVisible);
    assert.strictEqual(parseInt(page.overview.ilmHours.value, 10), 1);
    assert.strictEqual(
      page.overview.ilmDueDateAndTime.value,
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
    assert.strictEqual(parseInt(page.overview.ilmHours.value, 10), 3);
    await page.overview.ilmHours.edit();
    await page.overview.ilmHours.set(23);
    await page.overview.ilmHours.save();
    assert.strictEqual(parseInt(page.overview.ilmHours.value, 10), 23);
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
      page.overview.ilmDueDateAndTime.value,
      new Date(ilmSession.dueDate).toLocaleDateString('en', {
        month: 'numeric',
        day: 'numeric',
        year: '2-digit',
        hour12: true,
        hour: 'numeric',
        minute: 'numeric',
      })
    );
    await page.overview.ilmDueDateAndTime.edit();
    await page.overview.ilmDueDateAndTime.datePicker.set(newDate.toDate());
    await page.overview.ilmDueDateAndTime.timePicker.hour.select(newDate.format('h'));
    await page.overview.ilmDueDateAndTime.timePicker.minute.select(newDate.minute());
    await page.overview.ilmDueDateAndTime.timePicker.ampm.select(newDate.format('a'));

    await page.overview.ilmDueDateAndTime.save();
    assert.strictEqual(
      page.overview.ilmDueDateAndTime.value,
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
    assert.strictEqual(page.overview.title.value, session.title);
    await page.overview.title.edit();
    await page.overview.title.set('Rad Session Dude');
    await page.overview.title.save();
    assert.strictEqual(page.overview.title.value, 'Rad Session Dude');
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
    assert.strictEqual(page.overview.lastUpdated, 'Last Update Last Update: 07/09/2019 5:00 PM');
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
    assert.strictEqual(page.overview.sessionType.value, 'session type 0');
    await page.overview.sessionType.edit();
    await page.overview.sessionType.set(2);
    await page.overview.sessionType.save();
    assert.strictEqual(page.overview.sessionType.value, 'session type 1');
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
    assert.ok(page.overview.supplemental.isVisible);
    assert.ok(page.overview.specialAttire.isVisible);
    assert.ok(page.overview.specialEquipment.isVisible);
    assert.ok(page.overview.attendanceRequired.isVisible);
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
    assert.notOk(page.overview.supplemental.isVisible);
    assert.notOk(page.overview.specialAttire.isVisible);
    assert.notOk(page.overview.specialEquipment.isVisible);
    assert.notOk(page.overview.attendanceRequired.isVisible);
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
    assert.notOk(page.overview.supplemental.isVisible);
    assert.notOk(page.overview.specialAttire.isVisible);
    assert.notOk(page.overview.specialEquipment.isVisible);
    assert.notOk(page.overview.attendanceRequired.isVisible);
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
    assert.ok(page.overview.supplemental.isVisible);
    assert.strictEqual(page.overview.supplemental.yesNoToggle.checked, 'false');
    await page.overview.supplemental.yesNoToggle.click();
    assert.strictEqual(page.overview.supplemental.yesNoToggle.checked, 'true');
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
    assert.ok(page.overview.specialAttire.isVisible);
    assert.strictEqual(page.overview.specialAttire.yesNoToggle.checked, 'false');
    await page.overview.specialAttire.yesNoToggle.click();
    assert.strictEqual(page.overview.specialAttire.yesNoToggle.checked, 'true');
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
    assert.ok(page.overview.specialEquipment.isVisible);
    assert.strictEqual(page.overview.specialEquipment.yesNoToggle.checked, 'false');
    await page.overview.specialEquipment.yesNoToggle.click();
    assert.strictEqual(page.overview.specialEquipment.yesNoToggle.checked, 'true');
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
    assert.ok(page.overview.attendanceRequired.isVisible);
    assert.strictEqual(page.overview.attendanceRequired.yesNoToggle.checked, 'false');
    await page.overview.attendanceRequired.yesNoToggle.click();
    assert.strictEqual(page.overview.attendanceRequired.yesNoToggle.checked, 'true');
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
    assert.strictEqual(page.overview.sessionDescription.value, session.description);
    await page.overview.sessionDescription.edit();
    await page.overview.sessionDescription.set(newDescription);
    await page.overview.sessionDescription.save();
    assert.strictEqual(page.overview.sessionDescription.value, newDescription);
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
    assert.strictEqual(page.overview.sessionDescription.value, 'Click to edit');
    await page.overview.sessionDescription.edit();
    await page.overview.sessionDescription.set(newDescription);
    await page.overview.sessionDescription.save();
    assert.strictEqual(page.overview.sessionDescription.value, newDescription);
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
    assert.strictEqual(page.overview.sessionDescription.value, 'Click to edit');
    await page.overview.sessionDescription.edit();
    await page.overview.sessionDescription.set('<p>&nbsp</p><div></div><span>  </span>');
    await page.overview.sessionDescription.save();
    assert.strictEqual(page.overview.sessionDescription.value, 'Click to edit');
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
    assert.strictEqual(page.overview.sessionDescription.value, session.description);
    await page.overview.sessionDescription.edit();
    await page.overview.sessionDescription.set('<p>&nbsp</p><div></div><span>  </span>');
    await page.overview.sessionDescription.save();
    assert.strictEqual(page.overview.sessionDescription.value, 'Click to edit');
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
    assert.strictEqual(page.overview.sessionDescription.value, 'Click to edit');
    await page.overview.sessionDescription.edit();
    await page.overview.sessionDescription.set('something useless this way types');
    await page.overview.sessionDescription.cancel();
    assert.strictEqual(page.overview.sessionDescription.value, 'Click to edit');
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
    await page.overview.copy.visit();

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
    assert.notOk(page.overview.copy.isVisible);
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
    assert.ok(page.overview.copy.isVisible);
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
    assert.ok(page.overview.copy.isVisible);
    await page.overview.copy.visit();
    assert.strictEqual(currentRouteName(), 'session.copy');
    assert.notOk(page.overview.copy.isVisible);
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
    assert.strictEqual(page.overview.instructionalNotes.value, 'instructional note');
    await page.overview.instructionalNotes.edit();
    await page.overview.instructionalNotes.set(newInstructionalNotes);
    await page.overview.instructionalNotes.save();
    assert.strictEqual(page.overview.instructionalNotes.value, newInstructionalNotes);
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
    assert.strictEqual(page.overview.instructionalNotes.value, 'Click to edit');
    await page.overview.instructionalNotes.edit();
    await page.overview.instructionalNotes.set(newInstructionalNotes);
    await page.overview.instructionalNotes.save();
    assert.strictEqual(page.overview.instructionalNotes.value, newInstructionalNotes);
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
    assert.strictEqual(page.overview.instructionalNotes.value, 'Click to edit');
    await page.overview.instructionalNotes.edit();
    await page.overview.instructionalNotes.set('<p>&nbsp</p><div></div><span>  </span>');
    await page.overview.instructionalNotes.save();
    assert.strictEqual(page.overview.instructionalNotes.value, 'Click to edit');
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
    assert.strictEqual(page.overview.instructionalNotes.value, 'instructional note');
    await page.overview.instructionalNotes.edit();
    await page.overview.instructionalNotes.set('<p>&nbsp</p><div></div><span>  </span>');
    await page.overview.instructionalNotes.save();
    assert.strictEqual(page.overview.instructionalNotes.value, 'Click to edit');
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
    assert.strictEqual(page.overview.instructionalNotes.value, 'Click to edit');
    await page.overview.instructionalNotes.edit();
    await page.overview.instructionalNotes.set('something useless this way types');
    await page.overview.instructionalNotes.cancel();
    assert.strictEqual(page.overview.instructionalNotes.value, 'Click to edit');
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
    assert.strictEqual(page.overview.prerequisites.text, 'Prerequisites: None');
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
      page.overview.prerequisites.text,
      'Prerequisites: session 1, session 2, session 3'
    );
  });

  test('has no post-requisite', async function (assert) {
    enableFeature('sessionLinkingAdminUi');
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    this.server.create('session', {
      course: this.course,
    });
    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionLearnergroupDetails: true,
    });
    assert.strictEqual(page.overview.postrequisite.text, 'Due prior to: None');
  });

  test('has post-requisite', async function (assert) {
    enableFeature('sessionLinkingAdminUi');
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    const session = this.server.create('session', {
      course: this.course,
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
    assert.strictEqual(page.overview.postrequisite.text, 'Due prior to: session 1');
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
    assert.strictEqual(page.overview.postrequisite.value, 'None');
    await page.overview.postrequisite.edit();
    await page.overview.postrequisite.editor.postRequisites[1].click();
    await page.overview.postrequisite.editor.save();
    assert.strictEqual(page.overview.postrequisite.value, 'session 2');
  });

  test('shows expanded objectives if no objectives exist', async function (assert) {
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    this.server.create('session', { course: this.course });
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.strictEqual(currentRouteName(), 'session.index');
    assert.notOk(page.collapsedObjectives.isPresent);
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
    assert.ok(page.collapsedObjectives.isPresent);
  });
});
