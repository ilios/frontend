import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'frontend/tests/pages/components/school-session-attributes-collapsed';
import SchoolSessionAttributesCollapsed from 'frontend/components/school-session-attributes-collapsed';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | school session attributes collapsed', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('showSessionAttendanceRequired', false);
    this.set('showSessionSupplemental', true);
    this.set('showSessionSpecialAttireRequired', false);
    this.set('showSessionSpecialEquipmentRequired', false);
    await render(
      <template>
        <SchoolSessionAttributesCollapsed
          @showSessionAttendanceRequired={{this.showSessionAttendanceRequired}}
          @showSessionSupplemental={{this.showSessionSupplemental}}
          @showSessionSpecialAttireRequired={{this.showSessionSpecialAttireRequired}}
          @showSessionSpecialEquipmentRequired={{this.showSessionSpecialEquipmentRequired}}
          @expand={{(noop)}}
        />
      </template>,
    );

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
    this.set('expand', () => {
      assert.step('expand called');
    });
    await render(
      <template>
        <SchoolSessionAttributesCollapsed
          @showSessionAttendanceRequired={{true}}
          @showSessionSupplemental={{true}}
          @showSessionSpecialAttireRequired={{true}}
          @showSessionSpecialEquipmentRequired={{true}}
          @expand={{this.expand}}
        />
      </template>,
    );

    await component.expand();
    assert.verifySteps(['expand called']);
  });
});
