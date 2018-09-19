import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | school session attributes collapsed', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(12);

    this.set('nothing', parseInt);
    this.set('showSessionAttendanceRequired', false);
    this.set('showSessionSupplemental', true);
    this.set('showSessionSpecialAttireRequired', false);
    this.set('showSessionSpecialEquipmentRequired', false);
    this.set('nothing', parseInt);
    await render(hbs`{{school-session-attributes-collapsed
      showSessionAttendanceRequired=showSessionAttendanceRequired
      showSessionSupplemental=showSessionSupplemental
      showSessionSpecialAttireRequired=showSessionSpecialAttireRequired
      showSessionSpecialEquipmentRequired=showSessionSpecialEquipmentRequired
      expand=(action nothing)
    }}`);

    await settled();

    const rows = 'table tbody tr';
    const attendanceTitle = `${rows}:nth-of-type(1) td:nth-of-type(1)`;
    const attendanceEnabled = `${rows}:nth-of-type(1) td:nth-of-type(2) svg`;
    const supplementalTitle = `${rows}:nth-of-type(2) td:nth-of-type(1)`;
    const supplementalEnabled = `${rows}:nth-of-type(2) td:nth-of-type(2) svg`;
    const specialAttireTitle = `${rows}:nth-of-type(3) td:nth-of-type(1)`;
    const specialAttireEnabled = `${rows}:nth-of-type(3) td:nth-of-type(2) svg`;
    const specialEquipmentTitle = `${rows}:nth-of-type(4) td:nth-of-type(1)`;
    const specialEquipmentEnabled = `${rows}:nth-of-type(4) td:nth-of-type(2) svg`;

    assert.dom(attendanceTitle).hasText('Attendance Required');
    assert.dom(attendanceEnabled).hasClass('no');
    assert.dom(attendanceEnabled).hasClass('fa-ban');

    assert.dom(supplementalTitle).hasText('Supplemental Curriculum');
    assert.dom(supplementalEnabled).hasClass('yes');
    assert.dom(supplementalEnabled).hasClass('fa-check');

    assert.dom(specialAttireTitle).hasText('Special Attire Required');
    assert.dom(specialAttireEnabled).hasClass('no');
    assert.dom(specialAttireEnabled).hasClass('fa-ban');

    assert.dom(specialEquipmentTitle).hasText('Special Equipment Required');
    assert.dom(specialEquipmentEnabled).hasClass('no');
    assert.dom(specialEquipmentEnabled).hasClass('fa-ban');
  });
});
