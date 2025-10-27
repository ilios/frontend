import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'frontend/tests/pages/components/school-session-attributes-expanded';
import SchoolSessionAttributesExpanded from 'frontend/components/school-session-attributes-expanded';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | school session attributes expanded', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('showSessionAttendanceRequired', false);
    this.set('showSessionSupplemental', true);
    this.set('showSessionSpecialAttireRequired', false);
    this.set('showSessionSpecialEquipmentRequired', false);
    await render(
      <template>
        <SchoolSessionAttributesExpanded
          @showSessionAttendanceRequired={{this.showSessionAttendanceRequired}}
          @showSessionSupplemental={{this.showSessionSupplemental}}
          @showSessionSpecialAttireRequired={{this.showSessionSpecialAttireRequired}}
          @showSessionSpecialEquipmentRequired={{this.showSessionSpecialEquipmentRequired}}
          @collapse={{(noop)}}
          @manage={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.attributes.attendanceRequired.label, 'Attendance Required');
    assert.ok(component.attributes.attendanceRequired.isDisabled);
    assert.strictEqual(component.attributes.supplemental.label, 'Supplemental Curriculum');
    assert.ok(component.attributes.supplemental.isEnabled);
    assert.strictEqual(component.attributes.specialAttireRequired.label, 'Special Attire Required');
    assert.ok(component.attributes.specialAttireRequired.isDisabled);
    assert.strictEqual(
      component.attributes.specialEquipmentRequired.label,
      'Special Equipment Required',
    );
    assert.ok(component.attributes.specialEquipmentRequired.isDisabled);
    assert.notOk(component.manager.isVisible);
  });

  test('collapse', async function (assert) {
    this.set('collapse', () => {
      assert.step('collapse called');
    });
    await render(
      <template>
        <SchoolSessionAttributesExpanded
          @showSessionAttendanceRequired={{true}}
          @showSessionSupplemental={{true}}
          @showSessionSpecialAttireRequired={{true}}
          @showSessionSpecialEquipmentRequired={{true}}
          @collapse={{this.collapse}}
          @manage={{(noop)}}
        />
      </template>,
    );

    await component.collapse();
    assert.verifySteps(['collapse called']);
  });

  test('manage', async function (assert) {
    this.set('manage', () => {
      assert.step('manage called');
    });
    await render(
      <template>
        <SchoolSessionAttributesExpanded
          @showSessionAttendanceRequired={{this.showSessionAttendanceRequired}}
          @showSessionSupplemental={{this.showSessionSupplemental}}
          @showSessionSpecialAttireRequired={{this.showSessionSpecialAttireRequired}}
          @showSessionSpecialEquipmentRequired={{this.showSessionSpecialEquipmentRequired}}
          @collapse={{(noop)}}
          @canUpdate={{true}}
          @manage={{this.manage}}
        />
      </template>,
    );

    await component.manage();
    assert.verifySteps(['manage called']);
  });

  test('save', async function (assert) {
    this.set('save', (attributes) => {
      assert.step('save called');
      assert.ok(attributes.showSessionAttendanceRequired);
      assert.ok(attributes.showSessionSupplemental);
      assert.ok(attributes.showSessionSpecialAttireRequired);
      assert.ok(attributes.showSessionSpecialEquipmentRequired);
    });
    await render(
      <template>
        <SchoolSessionAttributesExpanded
          @showSessionAttendanceRequired={{false}}
          @showSessionSupplemental={{false}}
          @showSessionSpecialAttireRequired={{false}}
          @showSessionSpecialEquipmentRequired={{false}}
          @collapse={{(noop)}}
          @saveAll={{this.save}}
          @manage={{(noop)}}
          @isManaging={{true}}
        />
      </template>,
    );

    assert.notOk(component.manager.attendanceRequired.isChecked);
    assert.notOk(component.manager.supplemental.isChecked);
    assert.notOk(component.manager.specialAttireRequired.isChecked);
    assert.notOk(component.manager.specialEquipmentRequired.isChecked);

    await component.manager.attendanceRequired.check();
    await component.manager.supplemental.check();
    await component.manager.specialAttireRequired.check();
    await component.manager.specialEquipmentRequired.check();
    await component.save();
    assert.verifySteps(['save called']);
  });
});
