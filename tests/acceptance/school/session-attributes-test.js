import { click, visit } from '@ember/test-helpers';
import {
  module,
  test
} from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { getElementText, getText } from 'ilios/tests/helpers/custom-helpers';

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
    assert.dom(attendanceEnabled).hasClass('no');
    assert.dom(attendanceEnabled).hasClass('fa-ban');

    assert.equal(await getElementText(supplementalTitle), getText('Supplemental Curriculum'));
    assert.dom(supplementalEnabled).hasClass('yes');
    assert.dom(supplementalEnabled).hasClass('fa-check');

    assert.equal(await getElementText(specialAttireTitle), getText('Special Attire Required'));
    assert.dom(specialAttireEnabled).hasClass('no');
    assert.dom(specialAttireEnabled).hasClass('fa-ban');

    assert.equal(await getElementText(specialEquipmentTitle), getText('Special Equipment Required'));
    assert.dom(specialEquipmentEnabled).hasClass('no');
    assert.dom(specialEquipmentEnabled).hasClass('fa-ban');
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
    assert.dom(attendanceEnabled).hasClass('no');
    assert.dom(attendanceEnabled).hasClass('fa-ban');

    assert.equal(await getElementText(supplementalTitle), getText('Supplemental Curriculum'));
    assert.dom(supplementalEnabled).hasClass('yes');
    assert.dom(supplementalEnabled).hasClass('fa-check');

    assert.equal(await getElementText(specialAttireTitle), getText('Special Attire Required'));
    assert.dom(specialAttireEnabled).hasClass('no');
    assert.dom(specialAttireEnabled).hasClass('fa-ban');

    assert.equal(await getElementText(specialEquipmentTitle), getText('Special Equipment Required'));
    assert.dom(specialEquipmentEnabled).hasClass('no');
    assert.dom(specialEquipmentEnabled).hasClass('fa-ban');
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
    assert.dom(attendanceCheckbox).isNotChecked();

    assert.equal(await getElementText(supplementalTitle), getText('Supplemental Curriculum'));
    assert.dom(supplementalCheckbox).isChecked();

    assert.equal(await getElementText(specialAttireTitle), getText('Special Attire Required'));
    assert.dom(specialAttireCheckbox).isNotChecked();

    assert.equal(await getElementText(specialEquipmentTitle), getText('Special Equipment Required'));
    assert.dom(specialEquipmentCheckbox).isNotChecked();

    await click(attendanceCheckbox);
    await click(supplementalCheckbox);
    await click(specialEquipmentCheckbox);

    assert.dom(attendanceCheckbox).isChecked();
    assert.dom(supplementalCheckbox).isNotChecked();
    assert.dom(specialEquipmentCheckbox).isChecked();

    await click(save);

    assert.equal(await getElementText(attendanceTitle), getText('Attendance Required'));
    assert.dom(attendanceEnabled).hasClass('yes');
    assert.dom(attendanceEnabled).hasClass('fa-check');

    assert.equal(await getElementText(supplementalTitle), getText('Supplemental Curriculum'));
    assert.dom(supplementalEnabled).hasClass('no');
    assert.dom(supplementalEnabled).hasClass('fa-ban');

    assert.equal(await getElementText(specialAttireTitle), getText('Special Attire Required'));
    assert.dom(specialAttireEnabled).hasClass('no');
    assert.dom(specialAttireEnabled).hasClass('fa-ban');

    assert.equal(await getElementText(specialEquipmentTitle), getText('Special Equipment Required'));
    assert.dom(specialEquipmentEnabled).hasClass('yes');
    assert.dom(specialEquipmentEnabled).hasClass('fa-check');


  });
});
