import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';


module('Integration | Component | school session attributes manager', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(8);

    this.set('showSessionAttendanceRequired', false);
    this.set('showSessionSupplemental', true);
    this.set('showSessionSpecialAttireRequired', false);
    this.set('showSessionSpecialEquipmentRequired', false);
    this.set('nothing', parseInt);
    await render(hbs`{{school-session-attributes-manager
      showSessionAttendanceRequired=showSessionAttendanceRequired
      showSessionSupplemental=showSessionSupplemental
      showSessionSpecialAttireRequired=showSessionSpecialAttireRequired
      showSessionSpecialEquipmentRequired=showSessionSpecialEquipmentRequired
      enable=(action nothing)
      disable=(action nothing)
    }}`);

    const rows = 'table tbody tr';
    const attendanceTitle = `${rows}:eq(0) td:eq(0)`;
    const attendanceCheckbox = `${rows}:eq(0) td:eq(1) input`;
    const supplementalTitle = `${rows}:eq(1) td:eq(0)`;
    const supplementalCheckbox = `${rows}:eq(1) td:eq(1) input`;
    const specialAttireTitle = `${rows}:eq(2) td:eq(0)`;
    const specialAttireCheckbox = `${rows}:eq(2) td:eq(1) input`;
    const specialEquipmentTitle = `${rows}:eq(3) td:eq(0)`;
    const specialEquipmentCheckbox = `${rows}:eq(3) td:eq(1) input`;

    assert.equal(this.$(attendanceTitle).text().trim(), 'Attendance Required');
    assert.ok(this.$(attendanceCheckbox).not(':checked'));

    assert.equal(this.$(supplementalTitle).text().trim(), 'Supplemental Curriculum');
    assert.ok(this.$(supplementalCheckbox).is(':checked'));

    assert.equal(this.$(specialAttireTitle).text().trim(), 'Special Attire Required');
    assert.ok(this.$(specialAttireCheckbox).not(':checked'));

    assert.equal(this.$(specialEquipmentTitle).text().trim(), 'Special Equipment Required');
    assert.ok(this.$(specialEquipmentCheckbox).not(':checked'));
  });

  let selectTest = function(context, assert, name, position){
    assert.expect(3);

    context.set('showSessionAttendanceRequired', false);
    context.set('showSessionSupplemental', false);
    context.set('showSessionSpecialAttireRequired', false);
    context.set('showSessionSpecialEquipmentRequired', false);
    context.set('enable', (sentName) => {
      assert.equal(sentName, name);
      context.set(sentName, true);
    });
    context.set('nothing', parseInt);
    context.render(hbs`{{school-session-attributes-manager
      showSessionAttendanceRequired=showSessionAttendanceRequired
      showSessionSupplemental=showSessionSupplemental
      showSessionSpecialAttireRequired=showSessionSpecialAttireRequired
      showSessionSpecialEquipmentRequired=showSessionSpecialEquipmentRequired
      enable=(action enable)
      disable=(action nothing)
    }}`);

    const rows = 'table tbody tr';
    const checkbox = `${rows}:eq(${position}) td:eq(1) input`;
    assert.ok(context.$(checkbox).not(':checked'));
    context.$(checkbox).click();
    assert.ok(context.$(checkbox).is(':checked'));
  };

  test('select showSessionAttendanceRequired', function(assert) {
    selectTest(this, assert, 'showSessionAttendanceRequired', 0);
  });

  test('select showSessionSupplemental', function(assert) {
    selectTest(this, assert, 'showSessionSupplemental', 1);
  });

  test('select showSessionSpecialAttireRequired', function(assert) {
    selectTest(this, assert, 'showSessionSpecialAttireRequired', 2);
  });

  test('select showSessionSpecialEquipmentRequired', function(assert) {
    selectTest(this, assert, 'showSessionSpecialEquipmentRequired', 3);
  });

  let unSelectTest = function(context, assert, name, position){
    assert.expect(3);

    context.set('showSessionAttendanceRequired', true);
    context.set('showSessionSupplemental', true);
    context.set('showSessionSpecialAttireRequired', true);
    context.set('showSessionSpecialEquipmentRequired', true);
    context.set('disable', (sentName) => {
      assert.equal(sentName, name);
      context.set(sentName, false);
    });
    context.set('nothing', parseInt);
    context.render(hbs`{{school-session-attributes-manager
      showSessionAttendanceRequired=showSessionAttendanceRequired
      showSessionSupplemental=showSessionSupplemental
      showSessionSpecialAttireRequired=showSessionSpecialAttireRequired
      showSessionSpecialEquipmentRequired=showSessionSpecialEquipmentRequired
      enable=(action nothing)
      disable=(action disable)
    }}`);

    const rows = 'table tbody tr';
    const checkbox = `${rows}:eq(${position}) td:eq(1) input`;
    assert.ok(context.$(checkbox).is(':checked'));
    context.$(checkbox).click();
    assert.ok(context.$(checkbox).not(':checked'));
  };

  test('unSelect showSessionAttendanceRequired', function(assert) {
    unSelectTest(this, assert, 'showSessionAttendanceRequired', 0);
  });

  test('unSelect showSessionSupplemental', function(assert) {
    unSelectTest(this, assert, 'showSessionSupplemental', 1);
  });

  test('unSelect showSessionSpecialAttireRequired', function(assert) {
    unSelectTest(this, assert, 'showSessionSpecialAttireRequired', 2);
  });

  test('unSelect showSessionSpecialEquipmentRequired', function(assert) {
    unSelectTest(this, assert, 'showSessionSpecialEquipmentRequired', 3);
  });
});
