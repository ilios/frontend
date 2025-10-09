import { currentRouteName } from '@ember/test-helpers';
import { DateTime } from 'luxon';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'frontend/tests/helpers';
import page from 'ilios-common/page-objects/session';

module('Acceptance | Session - Overview', function (hooks) {
  setupApplicationTest(hooks);
  hooks.beforeEach(async function () {
    this.intl = this.owner.lookup('service:intl');
    this.school = this.server.create('school');
    this.server.create('academic-year');
    this.course = this.server.create('course', {
      school: this.school,
    });
    this.sessionTypes = this.server.createList('session-type', 2, {
      school: this.school,
    });
  });

  test('check fields', async function (assert) {
    assert.expect(4);
    await setupAuthentication(
      {
        school: this.school,
        administeredSchools: [this.school],
      },
      true,
    );
    const session = this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
      instructionalNotes: 'session notes',
    });
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.strictEqual(page.details.overview.sessionType.value, 'session type 0');
    assert.strictEqual(
      page.details.overview.sessionDescription.fadeText.displayText.text,
      session.description,
    );
    assert.strictEqual(
      page.details.overview.instructionalNotes.fadeText.displayText.text,
      'session notes',
    );
    assert.notOk(page.details.overview.ilm.ilmHours.isVisible);
  });

  test('check remove ilm', async function (assert) {
    await setupAuthentication(
      {
        school: this.school,
        administeredSchools: [this.school],
      },
      true,
    );
    const ilmSession = this.server.create('ilm-session');
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
      ilmSession,
    });
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.strictEqual(currentRouteName(), 'session.index');
    assert.ok(page.details.overview.ilm.ilmHours.isVisible);
    assert.ok(page.details.overview.ilm.ilmDueDateAndTime.isVisible);
    assert.strictEqual(parseInt(page.details.overview.ilm.ilmHours.value, 10), ilmSession.hours);
    assert.strictEqual(
      page.details.overview.ilm.ilmDueDateAndTime.value,
      this.intl.formatDate(ilmSession.dueDate, {
        month: '2-digit',
        day: '2-digit',
        year: '2-digit',
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
      }),
    );

    await page.details.overview.ilm.toggleIlm.yesNoToggle.click();

    assert.notOk(page.details.overview.ilm.ilmHours.isVisible);
    assert.notOk(page.details.overview.ilm.ilmDueDateAndTime.isVisible);
  });

  test('check add ilm', async function (assert) {
    await setupAuthentication(
      {
        school: this.school,
        administeredSchools: [this.school],
      },
      true,
    );
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
    });
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.strictEqual(currentRouteName(), 'session.index');
    assert.notOk(page.details.overview.ilm.ilmHours.isVisible);
    assert.notOk(page.details.overview.ilm.ilmDueDateAndTime.isVisible);

    await page.details.overview.ilm.toggleIlm.yesNoToggle.click();

    assert.ok(page.details.overview.ilm.ilmHours.isVisible);
    assert.ok(page.details.overview.ilm.ilmDueDateAndTime.isVisible);
    assert.strictEqual(parseInt(page.details.overview.ilm.ilmHours.value, 10), 1);
    assert.strictEqual(
      page.details.overview.ilm.ilmDueDateAndTime.value,
      this.intl.formatDate(DateTime.fromObject({ hour: 17, minute: 0 }).plus({ weeks: 6 }), {
        month: '2-digit',
        day: '2-digit',
        year: '2-digit',
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
      }),
    );
  });

  test('change ilm hours', async function (assert) {
    await setupAuthentication(
      {
        school: this.school,
        administeredSchools: [this.school],
      },
      true,
    );
    const ilmSession = this.server.create('ilm-session', {
      hours: 3,
    });
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
      ilmSession,
    });
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.strictEqual(currentRouteName(), 'session.index');
    assert.strictEqual(parseInt(page.details.overview.ilm.ilmHours.value, 10), 3);
    await page.details.overview.ilm.ilmHours.edit();
    await page.details.overview.ilm.ilmHours.set(23);
    await page.details.overview.ilm.ilmHours.save();
    assert.strictEqual(parseInt(page.details.overview.ilm.ilmHours.value, 10), 23);
  });

  test('change ilm due date and time', async function (assert) {
    await setupAuthentication(
      {
        school: this.school,
        administeredSchools: [this.school],
      },
      true,
    );
    const ilmSession = this.server.create('ilm-session', {
      hours: 3,
      dueDate: new Date(2021, 4, 18, 17, 0, 0),
    });
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
      ilmSession,
    });
    const newDate = DateTime.fromJSDate(ilmSession.dueDate)
      .set({ hour: 23, minute: 55 })
      .plus({ weeks: 3 });
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.strictEqual(currentRouteName(), 'session.index');
    assert.strictEqual(
      page.details.overview.ilm.ilmDueDateAndTime.value,
      this.intl.formatDate(ilmSession.dueDate, {
        month: '2-digit',
        day: '2-digit',
        year: '2-digit',
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
      }),
    );
    await page.details.overview.ilm.ilmDueDateAndTime.edit();
    await page.details.overview.ilm.ilmDueDateAndTime.datePicker.set(newDate.toJSDate());
    await page.details.overview.ilm.ilmDueDateAndTime.timePicker.hour.select(
      newDate.toFormat('hh'),
    );
    await page.details.overview.ilm.ilmDueDateAndTime.timePicker.minute.select(
      newDate.toFormat('mm'),
    );
    await page.details.overview.ilm.ilmDueDateAndTime.timePicker.ampm.select(newDate.toFormat('a'));

    await page.details.overview.ilm.ilmDueDateAndTime.save();
    assert.strictEqual(
      page.details.overview.ilm.ilmDueDateAndTime.value,
      this.intl.formatDate(newDate.toJSDate(), {
        month: '2-digit',
        day: '2-digit',
        year: '2-digit',
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
      }),
    );
  });

  test('change title', async function (assert) {
    await setupAuthentication(
      {
        school: this.school,
        administeredSchools: [this.school],
      },
      true,
    );
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
    await setupAuthentication(
      {
        school: this.school,
        administeredSchools: [this.school],
      },
      true,
    );
    const updatedAt = DateTime.fromObject({
      year: 2019,
      month: 7,
      day: 9,
      hour: 17,
      minute: 0,
      second: 0,
    }).toJSDate();
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
      updatedAt,
    });
    await page.visit({ courseId: 1, sessionId: 1 });
    const updatedAtString = this.intl.formatDate(updatedAt, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    assert.strictEqual(currentRouteName(), 'session.index');
    assert.strictEqual(
      page.details.overview.lastUpdated,
      `Last Update Last Update: ${updatedAtString}`,
    );
  });

  test('change type', async function (assert) {
    await setupAuthentication(
      {
        school: this.school,
        administeredSchools: [this.school],
      },
      true,
    );
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
    await setupAuthentication({ school: this.school }, true);
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
    await setupAuthentication({ school: this.school }, true);
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
    await setupAuthentication({ school: this.school }, true);
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
    await setupAuthentication(
      {
        school: this.school,
        administeredSchools: [this.school],
      },
      true,
    );
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
    await setupAuthentication(
      {
        school: this.school,
        administeredSchools: [this.school],
      },
      true,
    );
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
    await setupAuthentication(
      {
        school: this.school,
        administeredSchools: [this.school],
      },
      true,
    );
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

  test('change attendance required', async function (assert) {
    await setupAuthentication(
      {
        school: this.school,
        administeredSchools: [this.school],
      },
      true,
    );
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
    await setupAuthentication(
      {
        school: this.school,
        administeredSchools: [this.school],
      },
      true,
    );
    const session = this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
    });
    const newDescription = 'some new thing';
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.strictEqual(currentRouteName(), 'session.index');
    assert.strictEqual(
      page.details.overview.sessionDescription.fadeText.displayText.text,
      session.description,
    );
    await page.details.overview.sessionDescription.edit();
    await page.details.overview.sessionDescription.set(newDescription);
    await page.details.overview.sessionDescription.save();
    assert.strictEqual(
      page.details.overview.sessionDescription.fadeText.displayText.text,
      newDescription,
    );
  });

  test('add description', async function (assert) {
    await setupAuthentication(
      {
        school: this.school,
        administeredSchools: [this.school],
      },
      true,
    );
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
      description: null,
    });
    const newDescription = 'some new thing';
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.strictEqual(currentRouteName(), 'session.index');
    assert.strictEqual(page.details.overview.sessionDescription.text, 'Click to edit');
    await page.details.overview.sessionDescription.edit();
    await page.details.overview.sessionDescription.set(newDescription);
    await page.details.overview.sessionDescription.save();
    assert.strictEqual(
      page.details.overview.sessionDescription.fadeText.displayText.text,
      newDescription,
    );
  });

  test('empty description removes description', async function (assert) {
    await setupAuthentication(
      {
        school: this.school,
        administeredSchools: [this.school],
      },
      true,
    );
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
      description: null,
    });
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.strictEqual(currentRouteName(), 'session.index');
    assert.strictEqual(page.details.overview.sessionDescription.text, 'Click to edit');
    await page.details.overview.sessionDescription.edit();
    await page.details.overview.sessionDescription.set('<p>&nbsp</p><div></div><span>  </span>');
    await page.details.overview.sessionDescription.save();
    assert.strictEqual(page.details.overview.sessionDescription.text, 'Click to edit');
  });

  test('remove description', async function (assert) {
    await setupAuthentication(
      {
        school: this.school,
        administeredSchools: [this.school],
      },
      true,
    );
    const session = this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
    });
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.strictEqual(currentRouteName(), 'session.index');
    assert.strictEqual(
      page.details.overview.sessionDescription.fadeText.displayText.text,
      session.description,
    );
    await page.details.overview.sessionDescription.edit();
    await page.details.overview.sessionDescription.set('<p>&nbsp</p><div></div><span>  </span>');
    await page.details.overview.sessionDescription.save();
    assert.strictEqual(page.details.overview.sessionDescription.text, 'Click to edit');
  });

  test('cancel editing empty description #3210', async function (assert) {
    await setupAuthentication(
      {
        school: this.school,
        administeredSchools: [this.school],
      },
      true,
    );
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
      description: null,
    });
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.strictEqual(currentRouteName(), 'session.index');
    assert.strictEqual(page.details.overview.sessionDescription.text, 'Click to edit');
    await page.details.overview.sessionDescription.edit();
    await page.details.overview.sessionDescription.set('something useless this way types');
    await page.details.overview.sessionDescription.cancel();
    assert.strictEqual(page.details.overview.sessionDescription.text, 'Click to edit');
  });

  test('click copy', async function (assert) {
    await setupAuthentication(
      {
        school: this.school,
        administeredSchools: [this.school],
      },
      true,
    );
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
    });

    await page.visit({ courseId: 1, sessionId: 1 });
    await page.details.overview.copy.visit();

    assert.strictEqual(currentRouteName(), 'session.copy');
  });

  test('copy button is visible', async function (assert) {
    await setupAuthentication(
      {
        school: this.school,
        administeredSchools: [this.school],
      },
      true,
    );
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
    });
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.strictEqual(currentRouteName(), 'session.index');
    assert.ok(page.details.overview.copy.isVisible);
  });

  test('copy hidden on copy route', async function (assert) {
    await setupAuthentication(
      {
        school: this.school,
        administeredSchools: [this.school],
      },
      true,
    );
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
    await setupAuthentication(
      {
        school: this.school,
        administeredSchools: [this.school],
      },
      true,
    );
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
      instructionalNotes: 'instructional note',
    });
    const newInstructionalNotes = 'some new thing';
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.strictEqual(currentRouteName(), 'session.index', 'route name is correct');
    assert.strictEqual(
      page.details.overview.instructionalNotes.fadeText.displayText.text,
      'instructional note',
      'instructional notes value is correct',
    );
    await page.details.overview.instructionalNotes.edit();
    await page.details.overview.instructionalNotes.set(newInstructionalNotes);
    await page.details.overview.instructionalNotes.save();
    assert.strictEqual(
      page.details.overview.instructionalNotes.fadeText.displayText.text,
      newInstructionalNotes,
      'new instructional notes value is correct',
    );
    assert.strictEqual(
      this.server.db.sessions[0].instructionalNotes,
      `<p>${newInstructionalNotes}</p>`,
      'instructional notes value in database is correct',
    );
  });

  test('add instructionalNotes', async function (assert) {
    await setupAuthentication(
      {
        school: this.school,
        administeredSchools: [this.school],
      },
      true,
    );
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
    });
    const newInstructionalNotes = 'some new thing';
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.strictEqual(currentRouteName(), 'session.index', 'route name is correct');
    assert.strictEqual(
      page.details.overview.instructionalNotes.text,
      'Click to edit',
      'initial instructional notes value is correct',
    );
    await page.details.overview.instructionalNotes.edit();
    await page.details.overview.instructionalNotes.set(newInstructionalNotes);
    await page.details.overview.instructionalNotes.save();
    assert.strictEqual(
      page.details.overview.instructionalNotes.fadeText.displayText.text,
      newInstructionalNotes,
      'new instructional notes value is correct',
    );
    assert.strictEqual(
      this.server.db.sessions[0].instructionalNotes,
      `<p>${newInstructionalNotes}</p>`,
      'instructional notes value in database is correct',
    );
  });

  test('empty instructionalNotes removes instructionalNotes', async function (assert) {
    await setupAuthentication(
      {
        school: this.school,
        administeredSchools: [this.school],
      },
      true,
    );
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
    });
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.strictEqual(currentRouteName(), 'session.index');
    assert.strictEqual(page.details.overview.instructionalNotes.text, 'Click to edit');
    await page.details.overview.instructionalNotes.edit();
    await page.details.overview.instructionalNotes.set('<p>&nbsp</p><div></div><span>  </span>');
    await page.details.overview.instructionalNotes.save();
    assert.strictEqual(page.details.overview.instructionalNotes.text, 'Click to edit');
    assert.strictEqual(this.server.db.sessions[0].instructionalNotes, null);
  });

  test('remove instructionalNotes', async function (assert) {
    await setupAuthentication(
      {
        school: this.school,
        administeredSchools: [this.school],
      },
      true,
    );
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
      instructionalNotes: 'instructional note',
    });
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.strictEqual(currentRouteName(), 'session.index');
    assert.strictEqual(
      page.details.overview.instructionalNotes.fadeText.displayText.text,
      'instructional note',
    );
    await page.details.overview.instructionalNotes.edit();
    await page.details.overview.instructionalNotes.set('<p>&nbsp</p><div></div><span>  </span>');
    await page.details.overview.instructionalNotes.save();
    assert.strictEqual(page.details.overview.instructionalNotes.text, 'Click to edit');
  });

  test('cancel editing empty instructionalNotes #3210', async function (assert) {
    await setupAuthentication(
      {
        school: this.school,
        administeredSchools: [this.school],
      },
      true,
    );
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
    });
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.strictEqual(currentRouteName(), 'session.index');
    assert.strictEqual(page.details.overview.instructionalNotes.text, 'Click to edit');
    await page.details.overview.instructionalNotes.edit();
    await page.details.overview.instructionalNotes.set('something useless this way types');
    await page.details.overview.instructionalNotes.cancel();
    assert.strictEqual(page.details.overview.instructionalNotes.text, 'Click to edit');
  });

  test('has no pre-requisite', async function (assert) {
    await setupAuthentication(
      {
        school: this.school,
        administeredSchools: [this.school],
      },
      true,
    );
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
    });
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.strictEqual(page.details.overview.prerequisites.text, 'Prerequisites: None');
  });

  test('has pre-requisites', async function (assert) {
    await setupAuthentication(
      {
        school: this.school,
        administeredSchools: [this.school],
      },
      true,
    );
    const session = this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
    });
    this.server.createList('session', 3, {
      course: this.course,
      postrequisite: session,
    });
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
    });
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.strictEqual(
      page.details.overview.prerequisites.text,
      'Prerequisites: session 1, session 2, session 3',
    );
  });

  test('has no post-requisite', async function (assert) {
    await setupAuthentication(
      {
        school: this.school,
        administeredSchools: [this.school],
      },
      true,
    );
    const ilmSession = this.server.create('ilm-session');
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
      ilmSession,
    });
    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionLearnergroupDetails: true,
    });
    assert.strictEqual(page.details.overview.postrequisite.text, 'Due prior to: None');
    assert.ok(page.details.overview.ilm.ilmDueDateAndTime.isVisible);
  });

  test('has post-requisite', async function (assert) {
    await setupAuthentication(
      {
        school: this.school,
        administeredSchools: [this.school],
      },
      true,
    );
    const ilmSession = this.server.create('ilm-session');
    const session = this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
      ilmSession,
    });
    const postRequisite = this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
    });
    session.update('postrequisite', postRequisite);
    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionLearnergroupDetails: true,
    });
    assert.strictEqual(page.details.overview.postrequisite.text, 'Due prior to: session 1');
    assert.notOk(page.details.overview.ilm.ilmDueDateAndTime.isVisible);
  });

  test('change post-requisite', async function (assert) {
    await setupAuthentication(
      {
        school: this.school,
        administeredSchools: [this.school],
      },
      true,
    );
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
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
    await setupAuthentication(
      {
        school: this.school,
        administeredSchools: [this.school],
      },
      true,
    );
    this.server.create('session', { course: this.course, sessionType: this.sessionTypes[0] });
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.strictEqual(currentRouteName(), 'session.index');
    assert.notOk(page.details.collapsedObjectives.isPresent);
  });

  test('shows collapsed objectives if objectives exist', async function (assert) {
    await setupAuthentication(
      {
        school: this.school,
        administeredSchools: [this.school],
      },
      true,
    );
    const session = this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
    });
    this.server.create('session-objective', { session });
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.strictEqual(currentRouteName(), 'session.index');
    assert.ok(page.details.collapsedObjectives.isPresent);
  });

  test('shows associated learner groups', async function (assert) {
    await setupAuthentication(
      {
        school: this.school,
        administeredSchools: [this.school],
      },
      true,
    );
    const session = this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
    });
    const learnerGroups = this.server.createList('learner-group', 3);
    this.server.create('offering', { session, learnerGroups });
    this.server.create('offering', { session, learnerGroups });
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.strictEqual(currentRouteName(), 'session.index');
    assert.strictEqual(
      page.details.overview.associatedGroups.groups,
      'learner group 0, learner group 1, learner group 2',
    );
  });
});
