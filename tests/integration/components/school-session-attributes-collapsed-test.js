import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

moduleForComponent('school-session-attributes-collapsed', 'Integration | Component | school session attributes collapsed', {
  integration: true
});

test('it renders', async function(assert) {
  assert.expect(12);

  this.set('nothing', parseInt);
  this.set('showSessionAttendanceRequired', false);
  this.set('showSessionSupplemental', true);
  this.set('showSessionSpecialAttireRequired', false);
  this.set('showSessionSpecialEquipmentRequired', false);
  this.set('nothing', parseInt);
  this.render(hbs`{{school-session-attributes-collapsed
    showSessionAttendanceRequired=showSessionAttendanceRequired
    showSessionSupplemental=showSessionSupplemental
    showSessionSpecialAttireRequired=showSessionSpecialAttireRequired
    showSessionSpecialEquipmentRequired=showSessionSpecialEquipmentRequired
    expand=(action nothing)
  }}`);

  await wait();

  const rows = 'table tbody tr';
  const attendanceTitle = `${rows}:eq(0) td:eq(0)`;
  const attendanceEnabled = `${rows}:eq(0) td:eq(1) i`;
  const supplementalTitle = `${rows}:eq(1) td:eq(0)`;
  const supplementalEnabled = `${rows}:eq(1) td:eq(1) i`;
  const specialAttireTitle = `${rows}:eq(2) td:eq(0)`;
  const specialAttireEnabled = `${rows}:eq(2) td:eq(1) i`;
  const specialEquipmentTitle = `${rows}:eq(3) td:eq(0)`;
  const specialEquipmentEnabled = `${rows}:eq(3) td:eq(1) i`;

  assert.equal(this.$(attendanceTitle).text().trim(), 'Attendance Required');
  assert.ok(this.$(attendanceEnabled).hasClass('no'));
  assert.ok(this.$(attendanceEnabled).hasClass('fa-ban'));

  assert.equal(this.$(supplementalTitle).text().trim(), 'Supplemental Curriculum');
  assert.ok(this.$(supplementalEnabled).hasClass('yes'));
  assert.ok(this.$(supplementalEnabled).hasClass('fa-check'));

  assert.equal(this.$(specialAttireTitle).text().trim(), 'Special Attire Required');
  assert.ok(this.$(specialAttireEnabled).hasClass('no'));
  assert.ok(this.$(specialAttireEnabled).hasClass('fa-ban'));

  assert.equal(this.$(specialEquipmentTitle).text().trim(), 'Special Equipment Required');
  assert.ok(this.$(specialEquipmentEnabled).hasClass('no'));
  assert.ok(this.$(specialEquipmentEnabled).hasClass('fa-ban'));
});
