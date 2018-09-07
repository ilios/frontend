import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, find } from '@ember/test-helpers';
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

    assert.equal(find(attendanceTitle).textContent.trim(), 'Attendance Required');
    assert.ok(find(attendanceEnabled).classList.contains('no'));
    assert.ok(find(attendanceEnabled).classList.contains('fa-ban'));

    assert.equal(find(supplementalTitle).textContent.trim(), 'Supplemental Curriculum');
    assert.ok(find(supplementalEnabled).classList.contains('yes'));
    assert.ok(find(supplementalEnabled).classList.contains('fa-check'));

    assert.equal(find(specialAttireTitle).textContent.trim(), 'Special Attire Required');
    assert.ok(find(specialAttireEnabled).classList.contains('no'));
    assert.ok(find(specialAttireEnabled).classList.contains('fa-ban'));

    assert.equal(find(specialEquipmentTitle).textContent.trim(), 'Special Equipment Required');
    assert.ok(find(specialEquipmentEnabled).classList.contains('no'));
    assert.ok(find(specialEquipmentEnabled).classList.contains('fa-ban'));
  });
});
