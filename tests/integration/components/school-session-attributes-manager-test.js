import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { component } from 'ilios/tests/pages/components/school-session-attributes-manager';

module('Integration | Component | school session attributes manager', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('showSessionAttendanceRequired', false);
    this.set('showSessionSupplemental', true);
    this.set('showSessionSpecialAttireRequired', false);
    this.set('showSessionSpecialEquipmentRequired', false);
    await render(hbs`<SchoolSessionAttributesManager
      @showSessionAttendanceRequired={{showSessionAttendanceRequired}}
      @showSessionSupplemental={{showSessionSupplemental}}
      @showSessionSpecialAttireRequired={{showSessionSpecialAttireRequired}}
      @showSessionSpecialEquipmentRequired={{showSessionSpecialEquipmentRequired}}
      @enable={{(noop)}}
      @disable={{(noop)}}
    />`);

    assert.equal(component.attendanceRequired.label, 'Attendance Required');
    assert.notOk(component.attendanceRequired.isChecked);
    assert.equal(component.supplemental.label, 'Supplemental Curriculum');
    assert.ok(component.supplemental.isChecked);
    assert.equal(component.specialAttireRequired.label, 'Special Attire Required');
    assert.notOk(component.specialAttireRequired.isChecked);
    assert.equal(component.specialEquipmentRequired.label, 'Special Equipment Required');
    assert.notOk(component.specialEquipmentRequired.isChecked);
  });

  const selectTest = async function (context, assert, name, attribute) {
    context.set('showSessionAttendanceRequired', false);
    context.set('showSessionSupplemental', false);
    context.set('showSessionSpecialAttireRequired', false);
    context.set('showSessionSpecialEquipmentRequired', false);
    context.set('enable', (sentName) => {
      assert.equal(sentName, name);
      context.set(sentName, true);
    });
    await context.render(hbs`<SchoolSessionAttributesManager
      @showSessionAttendanceRequired={{showSessionAttendanceRequired}}
      @showSessionSupplemental={{showSessionSupplemental}}
      @showSessionSpecialAttireRequired={{showSessionSpecialAttireRequired}}
      @showSessionSpecialEquipmentRequired={{showSessionSpecialEquipmentRequired}}
      @enable={{this.enable}}
      @disable={{(noop)}}
    />`);

    assert.notOk(attribute.isChecked);
    await attribute.check();
    assert.ok(attribute.isChecked);
  };

  test('select showSessionAttendanceRequired', async function (assert) {
    assert.expect(3);
    await selectTest(this, assert, 'showSessionAttendanceRequired', component.attendanceRequired);
  });

  test('select showSessionSupplemental', async function (assert) {
    assert.expect(3);
    await selectTest(this, assert, 'showSessionSupplemental', component.supplemental);
  });

  test('select showSessionSpecialAttireRequired', async function (assert) {
    assert.expect(3);
    await selectTest(
      this,
      assert,
      'showSessionSpecialAttireRequired',
      component.specialAttireRequired
    );
  });

  test('select showSessionSpecialEquipmentRequired', async function (assert) {
    assert.expect(3);
    await selectTest(
      this,
      assert,
      'showSessionSpecialEquipmentRequired',
      component.specialEquipmentRequired
    );
  });

  const unSelectTest = async function (context, assert, name, attribute) {
    context.set('showSessionAttendanceRequired', true);
    context.set('showSessionSupplemental', true);
    context.set('showSessionSpecialAttireRequired', true);
    context.set('showSessionSpecialEquipmentRequired', true);
    await context.set('disable', (sentName) => {
      assert.equal(sentName, name);
      context.set(sentName, false);
    });
    await context.render(hbs`<SchoolSessionAttributesManager
      @showSessionAttendanceRequired={{showSessionAttendanceRequired}}
      @showSessionSupplemental={{showSessionSupplemental}}
      @showSessionSpecialAttireRequired={{showSessionSpecialAttireRequired}}
      @showSessionSpecialEquipmentRequired={{showSessionSpecialEquipmentRequired}}
      @enable={{(noop)}}
      @disable={{this.disable}}
    />`);

    assert.ok(attribute.isChecked);
    await attribute.check();
    assert.notOk(attribute.isChecked);
  };

  test('unSelect showSessionAttendanceRequired', async function (assert) {
    assert.expect(3);
    await unSelectTest(this, assert, 'showSessionAttendanceRequired', component.attendanceRequired);
  });

  test('unSelect showSessionSupplemental', async function (assert) {
    assert.expect(3);
    await unSelectTest(this, assert, 'showSessionSupplemental', component.supplemental);
  });

  test('unSelect showSessionSpecialAttireRequired', async function (assert) {
    assert.expect(3);
    await unSelectTest(
      this,
      assert,
      'showSessionSpecialAttireRequired',
      component.specialAttireRequired
    );
  });

  test('unSelect showSessionSpecialEquipmentRequired', async function (assert) {
    assert.expect(3);
    await unSelectTest(
      this,
      assert,
      'showSessionSpecialEquipmentRequired',
      component.specialEquipmentRequired
    );
  });
});
