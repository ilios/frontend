import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { component } from 'ilios/tests/pages/components/school-session-attributes-collapsed';

module('Integration | Component | school session attributes collapsed', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('showSessionAttendanceRequired', false);
    this.set('showSessionSupplemental', true);
    this.set('showSessionSpecialAttireRequired', false);
    this.set('showSessionSpecialEquipmentRequired', false);
    await render(hbs`<SchoolSessionAttributesCollapsed
      @showSessionAttendanceRequired={{this.showSessionAttendanceRequired}}
      @showSessionSupplemental={{this.showSessionSupplemental}}
      @showSessionSpecialAttireRequired={{this.showSessionSpecialAttireRequired}}
      @showSessionSpecialEquipmentRequired={{this.showSessionSpecialEquipmentRequired}}
      @expand={{(noop)}}
    />`);

    assert.strictEqual(component.attendanceRequired.label, 'Attendance Required');
    assert.ok(component.attendanceRequired.isDisabled);
    assert.strictEqual(component.supplemental.label, 'Supplemental Curriculum');
    assert.ok(component.supplemental.isEnabled);
    assert.strictEqual(component.specialAttireRequired.label, 'Special Attire Required');
    assert.ok(component.specialAttireRequired.isDisabled);
    assert.strictEqual(component.specialEquipmentRequired.label, 'Special Equipment Required');
    assert.ok(component.specialEquipmentRequired.isDisabled);
  });

  test('expand', async function (assert) {
    assert.expect(1);
    this.set('expand', () => {
      assert.ok(true, 'expand triggered.');
    });
    await render(hbs`<SchoolSessionAttributesCollapsed
      @showSessionAttendanceRequired={{true}}
      @showSessionSupplemental={{true}}
      @showSessionSpecialAttireRequired={{true}}
      @showSessionSpecialEquipmentRequired={{true}}
      @expand={{this.expand}}
    />`);

    await component.expand();
  });
});
