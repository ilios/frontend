import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'frontend/tests/pages/components/school-session-attributes-manager';
import SchoolSessionAttributesManager from 'frontend/components/school-session-attributes-manager';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | school session attributes manager', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('showSessionAttendanceRequired', false);
    this.set('showSessionSupplemental', true);
    this.set('showSessionSpecialAttireRequired', false);
    this.set('showSessionSpecialEquipmentRequired', false);
    await render(
      <template>
        <SchoolSessionAttributesManager
          @showSessionAttendanceRequired={{this.showSessionAttendanceRequired}}
          @showSessionSupplemental={{this.showSessionSupplemental}}
          @showSessionSpecialAttireRequired={{this.showSessionSpecialAttireRequired}}
          @showSessionSpecialEquipmentRequired={{this.showSessionSpecialEquipmentRequired}}
          @enable={{(noop)}}
          @disable={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.attendanceRequired.label, 'Attendance Required');
    assert.notOk(component.attendanceRequired.isChecked);
    assert.strictEqual(component.supplemental.label, 'Supplemental Curriculum');
    assert.ok(component.supplemental.isChecked);
    assert.strictEqual(component.specialAttireRequired.label, 'Special Attire Required');
    assert.notOk(component.specialAttireRequired.isChecked);
    assert.strictEqual(component.specialEquipmentRequired.label, 'Special Equipment Required');
    assert.notOk(component.specialEquipmentRequired.isChecked);
  });

  const selectTest = async function (context, assert, name, attribute) {
    context.set('showSessionAttendanceRequired', false);
    context.set('showSessionSupplemental', false);
    context.set('showSessionSpecialAttireRequired', false);
    context.set('showSessionSpecialEquipmentRequired', false);
    context.set('enable', (sentName) => {
      assert.strictEqual(sentName, name);
      context.set(sentName, true);
    });
    await render(
      <template>
        <SchoolSessionAttributesManager
          @showSessionAttendanceRequired={{context.showSessionAttendanceRequired}}
          @showSessionSupplemental={{context.showSessionSupplemental}}
          @showSessionSpecialAttireRequired={{context.showSessionSpecialAttireRequired}}
          @showSessionSpecialEquipmentRequired={{context.showSessionSpecialEquipmentRequired}}
          @enable={{context.enable}}
          @disable={{(noop)}}
        />
      </template>,
    );

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
      component.specialAttireRequired,
    );
  });

  test('select showSessionSpecialEquipmentRequired', async function (assert) {
    assert.expect(3);
    await selectTest(
      this,
      assert,
      'showSessionSpecialEquipmentRequired',
      component.specialEquipmentRequired,
    );
  });

  const unSelectTest = async function (context, assert, name, attribute) {
    context.set('showSessionAttendanceRequired', true);
    context.set('showSessionSupplemental', true);
    context.set('showSessionSpecialAttireRequired', true);
    context.set('showSessionSpecialEquipmentRequired', true);
    await context.set('disable', (sentName) => {
      assert.strictEqual(sentName, name);
      context.set(sentName, false);
    });
    await render(
      <template>
        <SchoolSessionAttributesManager
          @showSessionAttendanceRequired={{context.showSessionAttendanceRequired}}
          @showSessionSupplemental={{context.showSessionSupplemental}}
          @showSessionSpecialAttireRequired={{context.showSessionSpecialAttireRequired}}
          @showSessionSpecialEquipmentRequired={{context.showSessionSpecialEquipmentRequired}}
          @enable={{(noop)}}
          @disable={{context.disable}}
        />
      </template>,
    );

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
      component.specialAttireRequired,
    );
  });

  test('unSelect showSessionSpecialEquipmentRequired', async function (assert) {
    assert.expect(3);
    await unSelectTest(
      this,
      assert,
      'showSessionSpecialEquipmentRequired',
      component.specialEquipmentRequired,
    );
  });
});
