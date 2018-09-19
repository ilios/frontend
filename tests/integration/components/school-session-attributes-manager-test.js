import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
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
    const attendanceTitle = `${rows}:nth-of-type(1) td:nth-of-type(1)`;
    const attendanceCheckbox = `${rows}:nth-of-type(1) td:nth-of-type(2) input`;
    const supplementalTitle = `${rows}:nth-of-type(2) td:nth-of-type(1)`;
    const supplementalCheckbox = `${rows}:nth-of-type(2) td:nth-of-type(2) input`;
    const specialAttireTitle = `${rows}:nth-of-type(3) td:nth-of-type(1)`;
    const specialAttireCheckbox = `${rows}:nth-of-type(3) td:nth-of-type(2) input`;
    const specialEquipmentTitle = `${rows}:nth-of-type(4) td:nth-of-type(1)`;
    const specialEquipmentCheckbox = `${rows}:nth-of-type(4) td:nth-of-type(2) input`;

    assert.dom(attendanceTitle).hasText('Attendance Required');
    assert.dom(attendanceCheckbox).isNotChecked();

    assert.dom(supplementalTitle).hasText('Supplemental Curriculum');
    assert.dom(supplementalCheckbox).isChecked();

    assert.dom(specialAttireTitle).hasText('Special Attire Required');
    assert.dom(specialAttireCheckbox).isNotChecked();

    assert.dom(specialEquipmentTitle).hasText('Special Equipment Required');
    assert.dom(specialEquipmentCheckbox).isNotChecked();
  });

  let selectTest = async function(context, assert, name, position){
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
    await context.render(hbs`{{school-session-attributes-manager
      showSessionAttendanceRequired=showSessionAttendanceRequired
      showSessionSupplemental=showSessionSupplemental
      showSessionSpecialAttireRequired=showSessionSpecialAttireRequired
      showSessionSpecialEquipmentRequired=showSessionSpecialEquipmentRequired
      enable=(action enable)
      disable=(action nothing)
    }}`);

    const rows = 'table tbody tr';
    const checkbox = `${rows}:nth-of-type(${position + 1}) td:nth-of-type(2) input`;
    assert.dom(checkbox).isNotChecked();
    await click(checkbox);
    assert.dom(checkbox).isChecked();
  };

  test('select showSessionAttendanceRequired', async function(assert) {
    await selectTest(this, assert, 'showSessionAttendanceRequired', 0);
  });

  test('select showSessionSupplemental', async function(assert) {
    await selectTest(this, assert, 'showSessionSupplemental', 1);
  });

  test('select showSessionSpecialAttireRequired', async function(assert) {
    await selectTest(this, assert, 'showSessionSpecialAttireRequired', 2);
  });

  test('select showSessionSpecialEquipmentRequired', async function(assert) {
    await selectTest(this, assert, 'showSessionSpecialEquipmentRequired', 3);
  });

  let unSelectTest = async function(context, assert, name, position){
    assert.expect(3);

    context.set('showSessionAttendanceRequired', true);
    context.set('showSessionSupplemental', true);
    context.set('showSessionSpecialAttireRequired', true);
    context.set('showSessionSpecialEquipmentRequired', true);
    await context.set('disable', (sentName) => {
      assert.equal(sentName, name);
      context.set(sentName, false);
    });
    context.set('nothing', parseInt);
    await context.render(hbs`{{school-session-attributes-manager
      showSessionAttendanceRequired=showSessionAttendanceRequired
      showSessionSupplemental=showSessionSupplemental
      showSessionSpecialAttireRequired=showSessionSpecialAttireRequired
      showSessionSpecialEquipmentRequired=showSessionSpecialEquipmentRequired
      enable=(action nothing)
      disable=(action disable)
    }}`);

    const rows = 'table tbody tr';
    const checkbox = `${rows}:nth-of-type(${position + 1}) td:nth-of-type(2) input`;
    assert.dom(checkbox).isChecked();
    await click(checkbox);
    assert.dom(checkbox).isNotChecked();
  };

  test('unSelect showSessionAttendanceRequired', async function(assert) {
    await unSelectTest(this, assert, 'showSessionAttendanceRequired', 0);
  });

  test('unSelect showSessionSupplemental', async function(assert) {
    await unSelectTest(this, assert, 'showSessionSupplemental', 1);
  });

  test('unSelect showSessionSpecialAttireRequired', async function(assert) {
    await unSelectTest(this, assert, 'showSessionSpecialAttireRequired', 2);
  });

  test('unSelect showSessionSpecialEquipmentRequired', async function(assert) {
    await unSelectTest(this, assert, 'showSessionSpecialEquipmentRequired', 3);
  });
});
