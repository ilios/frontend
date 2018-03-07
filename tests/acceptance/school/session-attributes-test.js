import { click, find, visit } from '@ember/test-helpers';
import destroyApp from '../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

var application;
var url = '/schools/1';

module('Acceptance: School - Session Attributes', function(hooks) {
  hooks.beforeEach(function() {
    application = startApp();
    setupAuthentication(application);
  });

  hooks.afterEach(function() {
    destroyApp(application);
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
    const attendanceTitle = `${rows}:eq(0) td:eq(0)`;
    const attendanceEnabled = `${rows}:eq(0) td:eq(1) i`;
    const supplementalTitle = `${rows}:eq(1) td:eq(0)`;
    const supplementalEnabled = `${rows}:eq(1) td:eq(1) i`;
    const specialAttireTitle = `${rows}:eq(2) td:eq(0)`;
    const specialAttireEnabled = `${rows}:eq(2) td:eq(1) i`;
    const specialEquipmentTitle = `${rows}:eq(3) td:eq(0)`;
    const specialEquipmentEnabled = `${rows}:eq(3) td:eq(1) i`;

    assert.equal(getElementText(attendanceTitle), getText('Attendance Required'));
    assert.ok(find(attendanceEnabled).classList.contains('no'));
    assert.ok(find(attendanceEnabled).classList.contains('fa-ban'));

    assert.equal(getElementText(supplementalTitle), getText('Supplemental Curriculum'));
    assert.ok(find(supplementalEnabled).classList.contains('yes'));
    assert.ok(find(supplementalEnabled).classList.contains('fa-check'));

    assert.equal(getElementText(specialAttireTitle), getText('Special Attire Required'));
    assert.ok(find(specialAttireEnabled).classList.contains('no'));
    assert.ok(find(specialAttireEnabled).classList.contains('fa-ban'));

    assert.equal(getElementText(specialEquipmentTitle), getText('Special Equipment Required'));
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
    const attendanceTitle = `${rows}:eq(0) td:eq(0)`;
    const attendanceEnabled = `${rows}:eq(0) td:eq(1) i`;
    const supplementalTitle = `${rows}:eq(1) td:eq(0)`;
    const supplementalEnabled = `${rows}:eq(1) td:eq(1) i`;
    const specialAttireTitle = `${rows}:eq(2) td:eq(0)`;
    const specialAttireEnabled = `${rows}:eq(2) td:eq(1) i`;
    const specialEquipmentTitle = `${rows}:eq(3) td:eq(0)`;
    const specialEquipmentEnabled = `${rows}:eq(3) td:eq(1) i`;

    assert.equal(getElementText(attendanceTitle), getText('Attendance Required'));
    assert.ok(find(attendanceEnabled).classList.contains('no'));
    assert.ok(find(attendanceEnabled).classList.contains('fa-ban'));

    assert.equal(getElementText(supplementalTitle), getText('Supplemental Curriculum'));
    assert.ok(find(supplementalEnabled).classList.contains('yes'));
    assert.ok(find(supplementalEnabled).classList.contains('fa-check'));

    assert.equal(getElementText(specialAttireTitle), getText('Special Attire Required'));
    assert.ok(find(specialAttireEnabled).classList.contains('no'));
    assert.ok(find(specialAttireEnabled).classList.contains('fa-ban'));

    assert.equal(getElementText(specialEquipmentTitle), getText('Special Equipment Required'));
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
    const attendanceTitle = `${rows}:eq(0) td:eq(0)`;
    const attendanceCheckbox = `${rows}:eq(0) td:eq(1) input`;
    const supplementalTitle = `${rows}:eq(1) td:eq(0)`;
    const supplementalCheckbox = `${rows}:eq(1) td:eq(1) input`;
    const specialAttireTitle = `${rows}:eq(2) td:eq(0)`;
    const specialAttireCheckbox = `${rows}:eq(2) td:eq(1) input`;
    const specialEquipmentTitle = `${rows}:eq(3) td:eq(0)`;
    const specialEquipmentCheckbox = `${rows}:eq(3) td:eq(1) input`;
    const save = `.school-session-attributes-expanded .bigadd`;
    const attendanceEnabled = `${rows}:eq(0) td:eq(1) i`;
    const supplementalEnabled = `${rows}:eq(1) td:eq(1) i`;
    const specialAttireEnabled = `${rows}:eq(2) td:eq(1) i`;
    const specialEquipmentEnabled = `${rows}:eq(3) td:eq(1) i`;


    assert.equal(getElementText(attendanceTitle), getText('Attendance Required'));
    assert.ok(find(attendanceCheckbox).not(':checked'));

    assert.equal(getElementText(supplementalTitle), getText('Supplemental Curriculum'));
    assert.ok(find(supplementalCheckbox).is(':checked'));

    assert.equal(getElementText(specialAttireTitle), getText('Special Attire Required'));
    assert.ok(find(specialAttireCheckbox).not(':checked'));

    assert.equal(getElementText(specialEquipmentTitle), getText('Special Equipment Required'));
    assert.ok(find(specialEquipmentCheckbox).not(':checked'));

    await click(attendanceCheckbox);
    await click(supplementalCheckbox);
    await click(specialEquipmentCheckbox);

    assert.ok(find(attendanceCheckbox).is(':checked'));
    assert.ok(find(supplementalCheckbox).not(':checked'));
    assert.ok(find(specialEquipmentCheckbox).is(':checked'));

    await click(save);

    assert.equal(getElementText(attendanceTitle), getText('Attendance Required'));
    assert.ok(find(attendanceEnabled).classList.contains('yes'));
    assert.ok(find(attendanceEnabled).classList.contains('fa-check'));

    assert.equal(getElementText(supplementalTitle), getText('Supplemental Curriculum'));
    assert.ok(find(supplementalEnabled).classList.contains('no'));
    assert.ok(find(supplementalEnabled).classList.contains('fa-ban'));

    assert.equal(getElementText(specialAttireTitle), getText('Special Attire Required'));
    assert.ok(find(specialAttireEnabled).classList.contains('no'));
    assert.ok(find(specialAttireEnabled).classList.contains('fa-ban'));

    assert.equal(getElementText(specialEquipmentTitle), getText('Special Equipment Required'));
    assert.ok(find(specialEquipmentEnabled).classList.contains('yes'));
    assert.ok(find(specialEquipmentEnabled).classList.contains('fa-check'));


  });
});
