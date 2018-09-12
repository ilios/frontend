import { currentRouteName } from '@ember/test-helpers';
import moment from 'moment';
import {
  module,
  test
} from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

import { setupApplicationTest } from 'ember-qunit';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from 'ilios/tests/pages/session';

module('Acceptance | Session - Overview', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.server.create('academicYear');
    this.course = this.server.create('course', {
      school: this.school
    });
    this.sessionTypes = this.server.createList('sessionType', 2, {
      school: this.school
    });
    this.sessionDescription = this.server.create('sessionDescription');
  });

  test('check fields', async function(assert) {
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school]
    });
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
      sessionDescription: this.sessionDescription,
      instructionalNotes: 'session notes',
    });
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.equal(page.overview.sessionType.value, 'session type 0');
    assert.equal(page.overview.sessionDescription.value, this.sessionDescription.description);
    assert.equal(page.overview.instructionalNotes.value, 'session notes');
    assert.notOk(page.overview.ilmHours.isVisible);
  });

  test('check remove ilm', async function(assert) {
    await setupAuthentication({ school: this.school, administeredSchools: [this.school]});
    const ilmSession = this.server.create('ilmSession');
    this.server.create('session', {
      course: this.course,
      ilmSession
    });
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.equal(currentRouteName(), 'session.index');
    assert.ok(page.overview.ilmHours.isVisible);
    assert.ok(page.overview.ilmDueDate.isVisible);
    assert.equal(page.overview.ilmHours.value, ilmSession.hours);
    assert.equal(page.overview.ilmDueDate.value, moment(ilmSession.dueDate).format('L'));

    await page.overview.toggleIlm();

    assert.notOk(page.overview.ilmHours.isVisible);
    assert.notOk(page.overview.ilmDueDate.isVisible);
  });

  test('check add ilm', async function (assert) {
    await setupAuthentication({ school: this.school, administeredSchools: [this.school]});
    this.server.create('session', {
      course: this.course,
    });
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.equal(currentRouteName(), 'session.index');
    assert.notOk(page.overview.ilmHours.isVisible);
    assert.notOk(page.overview.ilmDueDate.isVisible);

    await page.overview.toggleIlm();

    assert.ok(page.overview.ilmHours.isVisible);
    assert.ok(page.overview.ilmDueDate.isVisible);
    assert.equal(page.overview.ilmHours.value, 1);
    assert.equal(page.overview.ilmDueDate.value, moment().add(6, 'weeks').format('L'));
  });

  test('change ilm hours', async function (assert) {
    await setupAuthentication({ school: this.school, administeredSchools: [this.school]});
    const ilmSession = this.server.create('ilmSession', {
      hours: 3
    });
    this.server.create('session', {
      course: this.course,
      ilmSession
    });
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.equal(currentRouteName(), 'session.index');
    assert.equal(page.overview.ilmHours.value, 3);
    await page.overview.ilmHours.edit();
    await page.overview.ilmHours.set(23);
    await page.overview.ilmHours.save();
    assert.equal(page.overview.ilmHours.value, 23);
  });

  test('change ilm due date', async function(assert) {
    await setupAuthentication({ school: this.school, administeredSchools: [this.school]});
    const ilmSession = this.server.create('ilmSession', {
      hours: 3
    });
    this.server.create('session', {
      course: this.course,
      ilmSession
    });
    const newDate = moment(ilmSession.dueDate).add(3, 'weeks');
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.equal(currentRouteName(), 'session.index');
    assert.equal(page.overview.ilmDueDate.value, moment(ilmSession.dueDate).format('L'));
    await page.overview.ilmDueDate.edit();
    await page.overview.ilmDueDate.set(newDate.toDate());
    await page.overview.ilmDueDate.save();
    assert.equal(page.overview.ilmDueDate.value, newDate.locale('en').format('L'));
  });

  test('change title', async function(assert) {
    await setupAuthentication({ school: this.school, administeredSchools: [this.school]});
    const session = this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0]
    });
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.equal(currentRouteName(), 'session.index');
    assert.equal(page.overview.title.value, session.title);
    await page.overview.title.edit();
    await page.overview.title.set('Rad Session Dude');
    await page.overview.title.save();
    assert.equal(page.overview.title.value, 'Rad Session Dude');
  });

  test('change type', async function (assert) {
    await setupAuthentication({ school: this.school, administeredSchools: [this.school]});
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0]
    });
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.equal(currentRouteName(), 'session.index');
    assert.equal(page.overview.sessionType.value, 'session type 0');
    await page.overview.sessionType.edit();
    await page.overview.sessionType.set(2);
    await page.overview.sessionType.save();
    assert.equal(page.overview.sessionType.value, 'session type 1');
  });

  test('session attributes are shown by school config', async function(assert) {
    assert.expect(5);
    await setupAuthentication({ school: this.school });
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0]
    });
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[1]
    });
    this.server.create('schoolConfig', {
      school: this.school,
      name: 'showSessionSupplemental',
      value: true
    });
    this.server.create('schoolConfig', {
      school: this.school,
      name: 'showSessionSpecialAttireRequired',
      value: true
    });
    this.server.create('schoolConfig', {
      school: this.school,
      name: 'showSessionSpecialEquipmentRequired',
      value: true
    });
    this.server.create('schoolConfig', {
      school: this.school,
      name: 'showSessionAttendanceRequired',
      value: true
    });
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.equal(currentRouteName(), 'session.index');
    assert.ok(page.overview.supplemental.isVisible);
    assert.ok(page.overview.specialAttire.isVisible);
    assert.ok(page.overview.specialEquipment.isVisible);
    assert.ok(page.overview.attendanceRequired.isVisible);
  });

  test('session attributes are hidden by school config', async function(assert) {
    assert.expect(5);
    await setupAuthentication({ school: this.school });
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0]
    });
    this.server.create('schoolConfig', {
      school: this.school,
      name: 'showSessionSupplemental',
      value: false
    });
    this.server.create('schoolConfig', {
      school: this.school,
      name: 'showSessionSpecialAttireRequired',
      value: false
    });
    this.server.create('schoolConfig', {
      school: this.school,
      name: 'showSessionSpecialEquipmentRequired',
      value: false
    });
    this.server.create('schoolConfig', {
      school: this.school,
      name: 'showSessionAttendanceRequired',
      value: false
    });
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.equal(currentRouteName(), 'session.index');
    assert.notOk(page.overview.supplemental.isVisible);
    assert.notOk(page.overview.specialAttire.isVisible);
    assert.notOk(page.overview.specialEquipment.isVisible);
    assert.notOk(page.overview.attendanceRequired.isVisible);
  });

  test('session attributes are hidden when there is no school config', async function(assert) {
    assert.expect(5);
    await setupAuthentication({ school: this.school });
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0]
    });
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.equal(currentRouteName(), 'session.index');
    assert.notOk(page.overview.supplemental.isVisible);
    assert.notOk(page.overview.specialAttire.isVisible);
    assert.notOk(page.overview.specialEquipment.isVisible);
    assert.notOk(page.overview.attendanceRequired.isVisible);
  });

  test('change supplemental', async function (assert) {
    await setupAuthentication({ school: this.school, administeredSchools: [this.school]});
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[1]
    });
    this.server.create('schoolConfig', {
      school: this.school,
      name: 'showSessionSupplemental',
      value: true
    });
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.equal(currentRouteName(), 'session.index');
    assert.ok(page.overview.supplemental.isVisible);
    assert.notOk(page.overview.supplemental.isActive);
    await page.overview.supplemental.click();
    assert.ok(page.overview.supplemental.isActive);
  });

  test('change special attire', async function (assert) {
    await setupAuthentication({ school: this.school, administeredSchools: [this.school]});
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[1]
    });
    this.server.create('schoolConfig', {
      school: this.school,
      name: 'showSessionSpecialAttireRequired',
      value: true
    });
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.equal(currentRouteName(), 'session.index');
    assert.ok(page.overview.specialAttire.isVisible);
    assert.notOk(page.overview.specialAttire.isActive);
    await page.overview.specialAttire.click();
    assert.ok(page.overview.specialAttire.isActive);
  });

  test('change special equipment', async function (assert) {
    await setupAuthentication({ school: this.school, administeredSchools: [this.school]});
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[1]
    });
    this.server.create('schoolConfig', {
      school: this.school,
      name: 'showSessionSpecialEquipmentRequired',
      value: true
    });
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.equal(currentRouteName(), 'session.index');
    assert.ok(page.overview.specialEquipment.isVisible);
    assert.notOk(page.overview.specialEquipment.isActive);
    await page.overview.specialEquipment.click();
    assert.ok(page.overview.specialEquipment.isActive);
  });

  test('change attendance rquired', async function (assert) {
    await setupAuthentication({ school: this.school, administeredSchools: [this.school]});
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[1]
    });
    this.server.create('schoolConfig', {
      school: this.school,
      name: 'showSessionAttendanceRequired',
      value: true
    });
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.equal(currentRouteName(), 'session.index');
    assert.ok(page.overview.attendanceRequired.isVisible);
    assert.notOk(page.overview.attendanceRequired.isActive);
    await page.overview.attendanceRequired.click();
    assert.ok(page.overview.attendanceRequired.isActive);
  });

  test('change description', async function(assert) {
    await setupAuthentication({ school: this.school, administeredSchools: [this.school]});
    this.server.create('session', {
      course: this.course,
      sessionDescription: this.sessionDescription
    });
    const newDescription = 'some new thing';
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.equal(currentRouteName(), 'session.index');
    assert.equal(page.overview.sessionDescription.value, this.sessionDescription.description);
    await page.overview.sessionDescription.edit();
    await page.overview.sessionDescription.set(newDescription);
    await page.overview.sessionDescription.save();
    assert.equal(page.overview.sessionDescription.value, newDescription);
  });

  test('add description', async function(assert) {
    await setupAuthentication({ school: this.school, administeredSchools: [this.school]});
    this.server.create('session', {
      course: this.course,
    });
    const newDescription = 'some new thing';
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.equal(currentRouteName(), 'session.index');
    assert.equal(page.overview.sessionDescription.value, 'Click to edit');
    await page.overview.sessionDescription.edit();
    await page.overview.sessionDescription.set(newDescription);
    await page.overview.sessionDescription.save();
    assert.equal(page.overview.sessionDescription.value, newDescription);
  });

  test('empty description removes description', async function (assert) {
    await setupAuthentication({ school: this.school, administeredSchools: [this.school]});
    this.server.create('session', {
      course: this.course,
    });
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.equal(currentRouteName(), 'session.index');
    assert.equal(page.overview.sessionDescription.value, 'Click to edit');
    await page.overview.sessionDescription.edit();
    await page.overview.sessionDescription.set('<p>&nbsp</p><div></div><span>  </span>');
    await page.overview.sessionDescription.save();
    assert.equal(page.overview.sessionDescription.value, 'Click to edit');
  });

  test('remove description', async function(assert) {
    await setupAuthentication({ school: this.school, administeredSchools: [this.school]});
    this.server.create('session', {
      course: this.course,
      sessionDescription: this.sessionDescription
    });
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.equal(currentRouteName(), 'session.index');
    assert.equal(page.overview.sessionDescription.value, this.sessionDescription.description);
    await page.overview.sessionDescription.edit();
    await page.overview.sessionDescription.set('<p>&nbsp</p><div></div><span>  </span>');
    await page.overview.sessionDescription.save();
    assert.equal(page.overview.sessionDescription.value, 'Click to edit');
  });

  test('cancel editing empty description #3210', async function(assert) {
    await setupAuthentication({ school: this.school, administeredSchools: [this.school]});
    this.server.create('session', {
      course: this.course,
    });
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.equal(currentRouteName(), 'session.index');
    assert.equal(page.overview.sessionDescription.value, 'Click to edit');
    await page.overview.sessionDescription.edit();
    await page.overview.sessionDescription.set('something useless this way types');
    await page.overview.sessionDescription.cancel();
    assert.equal(page.overview.sessionDescription.value, 'Click to edit');
  });


  test('click copy', async function(assert) {
    await setupAuthentication({ school: this.school, administeredSchools: [this.school]});
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0]
    });

    await page.visit({ courseId: 1, sessionId: 1 });
    await page.overview.copy.visit();

    assert.equal(currentRouteName(), 'session.copy');
  });

  test('copy hidden from unprivledged users', async function(assert) {
    await setupAuthentication({ school: this.school});
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0]
    });
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.equal(currentRouteName(), 'session.index');
    assert.notOk(page.overview.copy.isVisible);
  });

  test('copy visible to privileged users', async function(assert) {
    await setupAuthentication({ school: this.school, administeredSchools: [this.school]});
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0]
    });
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.equal(currentRouteName(), 'session.index');
    assert.ok(page.overview.copy.isVisible);
  });

  test('copy hidden on copy route', async function(assert) {
    await setupAuthentication({ school: this.school, administeredSchools: [this.school]});
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0]
    });
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.equal(currentRouteName(), 'session.index');
    assert.ok(page.overview.copy.isVisible);
    await page.overview.copy.visit();
    assert.equal(currentRouteName(), 'session.copy');
    assert.notOk(page.overview.copy.isVisible);
  });

  test('change instructionalNotes', async function(assert) {
    await setupAuthentication({ school: this.school, administeredSchools: [this.school]});
    this.server.create('session', {
      course: this.course,
      instructionalNotes: 'instructional note'
    });
    const newInstructionalNotes = 'some new thing';
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.equal(currentRouteName(), 'session.index');
    assert.equal(page.overview.instructionalNotes.value, 'instructional note');
    await page.overview.instructionalNotes.edit();
    await page.overview.instructionalNotes.set(newInstructionalNotes);
    await page.overview.instructionalNotes.save();
    assert.equal(page.overview.instructionalNotes.value, newInstructionalNotes);
    assert.equal(this.server.db.sessions[0].instructionalNotes, `<p>${newInstructionalNotes}</p>`);
  });

  test('add instructionalNotes', async function(assert) {
    await setupAuthentication({ school: this.school, administeredSchools: [this.school]});
    this.server.create('session', {
      course: this.course,
    });
    const newInstructionalNotes = 'some new thing';
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.equal(currentRouteName(), 'session.index');
    assert.equal(page.overview.instructionalNotes.value, 'Click to edit');
    await page.overview.instructionalNotes.edit();
    await page.overview.instructionalNotes.set(newInstructionalNotes);
    await page.overview.instructionalNotes.save();
    assert.equal(page.overview.instructionalNotes.value, newInstructionalNotes);
    assert.equal(this.server.db.sessions[0].instructionalNotes, `<p>${newInstructionalNotes}</p>`);
  });

  test('empty instructionalNotes removes instructionalNotes', async function (assert) {
    await setupAuthentication({ school: this.school, administeredSchools: [this.school]});
    this.server.create('session', {
      course: this.course,
    });
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.equal(currentRouteName(), 'session.index');
    assert.equal(page.overview.instructionalNotes.value, 'Click to edit');
    await page.overview.instructionalNotes.edit();
    await page.overview.instructionalNotes.set('<p>&nbsp</p><div></div><span>  </span>');
    await page.overview.instructionalNotes.save();
    assert.equal(page.overview.instructionalNotes.value, 'Click to edit');
    assert.equal(this.server.db.sessions[0].instructionalNotes, null);
  });

  test('remove instructionalNotes', async function(assert) {
    await setupAuthentication({ school: this.school, administeredSchools: [this.school]});
    this.server.create('session', {
      course: this.course,
      instructionalNotes: 'instructional note'
    });
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.equal(currentRouteName(), 'session.index');
    assert.equal(page.overview.instructionalNotes.value, 'instructional note');
    await page.overview.instructionalNotes.edit();
    await page.overview.instructionalNotes.set('<p>&nbsp</p><div></div><span>  </span>');
    await page.overview.instructionalNotes.save();
    assert.equal(page.overview.instructionalNotes.value, 'Click to edit');
  });

  test('cancel editing empty instructionalNotes #3210', async function(assert) {
    await setupAuthentication({ school: this.school, administeredSchools: [this.school]});
    this.server.create('session', {
      course: this.course,
    });
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.equal(currentRouteName(), 'session.index');
    assert.equal(page.overview.instructionalNotes.value, 'Click to edit');
    await page.overview.instructionalNotes.edit();
    await page.overview.instructionalNotes.set('something useless this way types');
    await page.overview.instructionalNotes.cancel();
    assert.equal(page.overview.instructionalNotes.value, 'Click to edit');
  });
});
