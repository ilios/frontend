import { click, find, visit } from '@ember/test-helpers';
import {
  module,
  test
} from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { getElementText, getText } from 'ilios-common';

const url = '/schools/1';
module('Acceptance | School - Session Attributes', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    await setupAuthentication({ school });
  });

  test('check fields collapsed', async function(assert) {
    assert.expect(12);
    this.server.create('school');
    this.server.create('schoolConfig', {
      schoolId: 1,
      name: 'showSessionAttendanceRequired',
      value: false
    });
    this.server.create('schoolConfig', {
      schoolId: 1,
      name: 'showSessionSupplemental',
      value: true
    });
    await visit(url);

    const rows = '.school-session-attributes-collapsed table tbody tr';
    const attendanceTitle = `${rows}:nth-of-type(1) td:nth-of-type(1)`;
    const attendanceEnabled = `${rows}:nth-of-type(1) td:nth-of-type(2) svg`;
    const supplementalTitle = `${rows}:nth-of-type(2) td:nth-of-type(1)`;
    const supplementalEnabled = `${rows}:nth-of-type(2) td:nth-of-type(2) svg`;
    const specialAttireTitle = `${rows}:nth-of-type(3) td:nth-of-type(1)`;
    const specialAttireEnabled = `${rows}:nth-of-type(3) td:nth-of-type(2) svg`;
    const specialEquipmentTitle = `${rows}:nth-of-type(4) td:nth-of-type(1)`;
    const specialEquipmentEnabled = `${rows}:nth-of-type(4) td:nth-of-type(2) svg`;

    assert.equal(await getElementText(attendanceTitle), getText('Attendance Required'));
    assert.ok(find(attendanceEnabled).classList.contains('no'));
    assert.ok(find(attendanceEnabled).classList.contains('fa-ban'));

    assert.equal(await getElementText(supplementalTitle), getText('Supplemental Curriculum'));
    assert.ok(find(supplementalEnabled).classList.contains('yes'));
    assert.ok(find(supplementalEnabled).classList.contains('fa-check'));

    assert.equal(await getElementText(specialAttireTitle), getText('Special Attire Required'));
    assert.ok(find(specialAttireEnabled).classList.contains('no'));
    assert.ok(find(specialAttireEnabled).classList.contains('fa-ban'));

    assert.equal(await getElementText(specialEquipmentTitle), getText('Special Equipment Required'));
    assert.ok(find(specialEquipmentEnabled).classList.contains('no'));
    assert.ok(find(specialEquipmentEnabled).classList.contains('fa-ban'));
  });

  test('check fields expanded', async function(assert) {
    assert.expect(12);
    this.server.create('school');
    this.server.create('schoolConfig', {
      schoolId: 1,
      name: 'showSessionAttendanceRequired',
      value: false
    });
    this.server.create('schoolConfig', {
      schoolId: 1,
      name: 'showSessionSupplemental',
      value: true
    });
    await visit(`${url}?schoolSessionAttributesDetails=true`);

    const rows = '.school-session-attributes-expanded table tbody tr';
    const attendanceTitle = `${rows}:nth-of-type(1) td:nth-of-type(1)`;
    const attendanceEnabled = `${rows}:nth-of-type(1) td:nth-of-type(2) svg`;
    const supplementalTitle = `${rows}:nth-of-type(2) td:nth-of-type(1)`;
    const supplementalEnabled = `${rows}:nth-of-type(2) td:nth-of-type(2) svg`;
    const specialAttireTitle = `${rows}:nth-of-type(3) td:nth-of-type(1)`;
    const specialAttireEnabled = `${rows}:nth-of-type(3) td:nth-of-type(2) svg`;
    const specialEquipmentTitle = `${rows}:nth-of-type(4) td:nth-of-type(1)`;
    const specialEquipmentEnabled = `${rows}:nth-of-type(4) td:nth-of-type(2) svg`;

    assert.equal(await getElementText(attendanceTitle), getText('Attendance Required'));
    assert.ok(find(attendanceEnabled).classList.contains('no'));
    assert.ok(find(attendanceEnabled).classList.contains('fa-ban'));

    assert.equal(await getElementText(supplementalTitle), getText('Supplemental Curriculum'));
    assert.ok(find(supplementalEnabled).classList.contains('yes'));
    assert.ok(find(supplementalEnabled).classList.contains('fa-check'));

    assert.equal(await getElementText(specialAttireTitle), getText('Special Attire Required'));
    assert.ok(find(specialAttireEnabled).classList.contains('no'));
    assert.ok(find(specialAttireEnabled).classList.contains('fa-ban'));

    assert.equal(await getElementText(specialEquipmentTitle), getText('Special Equipment Required'));
    assert.ok(find(specialEquipmentEnabled).classList.contains('no'));
    assert.ok(find(specialEquipmentEnabled).classList.contains('fa-ban'));
  });

  test('manage session attributes', async function(assert) {
    assert.expect(23);
    this.server.create('school');
    this.server.create('schoolConfig', {
      schoolId: 1,
      name: 'showSessionAttendanceRequired',
      value: false
    });
    this.server.create('schoolConfig', {
      schoolId: 1,
      name: 'showSessionSupplemental',
      value: true
    });
    await visit(`${url}?schoolSessionAttributesDetails=true&schoolManageSessionAttributes=true`);

    const rows = '.school-session-attributes-expanded table tbody tr';
    const attendanceTitle = `${rows}:nth-of-type(1) td:nth-of-type(1)`;
    const attendanceCheckbox = `${rows}:nth-of-type(1) td:nth-of-type(2) input`;
    const supplementalTitle = `${rows}:nth-of-type(2) td:nth-of-type(1)`;
    const supplementalCheckbox = `${rows}:nth-of-type(2) td:nth-of-type(2) input`;
    const specialAttireTitle = `${rows}:nth-of-type(3) td:nth-of-type(1)`;
    const specialAttireCheckbox = `${rows}:nth-of-type(3) td:nth-of-type(2) input`;
    const specialEquipmentTitle = `${rows}:nth-of-type(4) td:nth-of-type(1)`;
    const specialEquipmentCheckbox = `${rows}:nth-of-type(4) td:nth-of-type(2) input`;
    const save = `.school-session-attributes-expanded .bigadd`;
    const attendanceEnabled = `${rows}:nth-of-type(1) td:nth-of-type(2) svg`;
    const supplementalEnabled = `${rows}:nth-of-type(2) td:nth-of-type(2) svg`;
    const specialAttireEnabled = `${rows}:nth-of-type(3) td:nth-of-type(2) svg`;
    const specialEquipmentEnabled = `${rows}:nth-of-type(4) td:nth-of-type(2) svg`;


    assert.equal(await getElementText(attendanceTitle), getText('Attendance Required'));
    assert.notOk(find(attendanceCheckbox).checked);

    assert.equal(await getElementText(supplementalTitle), getText('Supplemental Curriculum'));
    assert.ok(find(supplementalCheckbox).checked);

    assert.equal(await getElementText(specialAttireTitle), getText('Special Attire Required'));
    assert.notOk(find(specialAttireCheckbox).checked);

    assert.equal(await getElementText(specialEquipmentTitle), getText('Special Equipment Required'));
    assert.notOk(find(specialEquipmentCheckbox).checked);

    await click(attendanceCheckbox);
    await click(supplementalCheckbox);
    await click(specialEquipmentCheckbox);

    assert.ok(find(attendanceCheckbox).checked);
    assert.notOk(find(supplementalCheckbox).checked);
    assert.ok(find(specialEquipmentCheckbox).checked);

    await click(save);

    assert.equal(await getElementText(attendanceTitle), getText('Attendance Required'));
    assert.ok(find(attendanceEnabled).classList.contains('yes'));
    assert.ok(find(attendanceEnabled).classList.contains('fa-check'));

    assert.equal(await getElementText(supplementalTitle), getText('Supplemental Curriculum'));
    assert.ok(find(supplementalEnabled).classList.contains('no'));
    assert.ok(find(supplementalEnabled).classList.contains('fa-ban'));

    assert.equal(await getElementText(specialAttireTitle), getText('Special Attire Required'));
    assert.ok(find(specialAttireEnabled).classList.contains('no'));
    assert.ok(find(specialAttireEnabled).classList.contains('fa-ban'));

    assert.equal(await getElementText(specialEquipmentTitle), getText('Special Equipment Required'));
    assert.ok(find(specialEquipmentEnabled).classList.contains('yes'));
    assert.ok(find(specialEquipmentEnabled).classList.contains('fa-check'));


  });
});
