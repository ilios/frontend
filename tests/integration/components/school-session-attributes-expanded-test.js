import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios/tests/pages/components/school-session-attributes-expanded';

module('Integration | Component | school session attributes expanded', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders', async function (assert) {
    this.set('showSessionAttendanceRequired', false);
    this.set('showSessionSupplemental', true);
    this.set('showSessionSpecialAttireRequired', false);
    this.set('showSessionSpecialEquipmentRequired', false);
    await render(hbs`<SchoolSessionAttributesExpanded
      @showSessionAttendanceRequired={{this.showSessionAttendanceRequired}}
      @showSessionSupplemental={{this.showSessionSupplemental}}
      @showSessionSpecialAttireRequired={{this.showSessionSpecialAttireRequired}}
      @showSessionSpecialEquipmentRequired={{this.showSessionSpecialEquipmentRequired}}
      @collapse={{(noop)}}
      @manage={{(noop)}}
    />`);

    assert.strictEqual(component.attributes.attendanceRequired.label, 'Attendance Required');
    assert.ok(component.attributes.attendanceRequired.isDisabled);
    assert.strictEqual(component.attributes.supplemental.label, 'Supplemental Curriculum');
    assert.ok(component.attributes.supplemental.isEnabled);
    assert.strictEqual(component.attributes.specialAttireRequired.label, 'Special Attire Required');
    assert.ok(component.attributes.specialAttireRequired.isDisabled);
    assert.strictEqual(
      component.attributes.specialEquipmentRequired.label,
      'Special Equipment Required'
    );
    assert.ok(component.attributes.specialEquipmentRequired.isDisabled);
    assert.notOk(component.manager.isVisible);
  });

  test('collapse', async function (assert) {
    assert.expect(1);
    this.set('collapse', () => {
      assert.ok(true, 'Collapse triggered.');
    });
    await render(hbs`<SchoolSessionAttributesExpanded
      @showSessionAttendanceRequired={{true}}
      @showSessionSupplemental={{true}}
      @showSessionSpecialAttireRequired={{true}}
      @showSessionSpecialEquipmentRequired={{true}}
      @collapse={{this.collapse}}
      @manage={{(noop)}}
    />`);

    await component.collapse();
  });

  test('manage', async function (assert) {
    assert.expect(1);
    this.set('manage', () => {
      assert.ok(true, 'Manage triggered.');
    });
    await render(hbs`<SchoolSessionAttributesExpanded
      @showSessionAttendanceRequired={{this.showSessionAttendanceRequired}}
      @showSessionSupplemental={{this.showSessionSupplemental}}
      @showSessionSpecialAttireRequired={{this.showSessionSpecialAttireRequired}}
      @showSessionSpecialEquipmentRequired={{this.showSessionSpecialEquipmentRequired}}
      @collapse={{(noop)}}
      @canUpdate={{true}}
      @manage={{this.manage}}
    />`);

    await component.manage();
  });

  test('save', async function (assert) {
    assert.expect(8);
    this.set('save', (attributes) => {
      assert.ok(attributes.showSessionAttendanceRequired);
      assert.ok(attributes.showSessionSupplemental);
      assert.ok(attributes.showSessionSpecialAttireRequired);
      assert.ok(attributes.showSessionSpecialEquipmentRequired);
    });
    await render(hbs`<SchoolSessionAttributesExpanded
      @showSessionAttendanceRequired={{false}}
      @showSessionSupplemental={{false}}
      @showSessionSpecialAttireRequired={{false}}
      @showSessionSpecialEquipmentRequired={{false}}
      @collapse={{(noop)}}
      @saveAll={{this.save}}
      @manage={{(noop)}}
      @isManaging={{true}}
    />`);

    assert.notOk(component.manager.attendanceRequired.isChecked);
    assert.notOk(component.manager.supplemental.isChecked);
    assert.notOk(component.manager.specialAttireRequired.isChecked);
    assert.notOk(component.manager.specialEquipmentRequired.isChecked);

    await component.manager.attendanceRequired.check();
    await component.manager.supplemental.check();
    await component.manager.specialAttireRequired.check();
    await component.manager.specialEquipmentRequired.check();
    await component.save();
  });
});
