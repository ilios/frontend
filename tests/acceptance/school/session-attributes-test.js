import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from 'ilios/tests/pages/school';
import percySnapshot from '@percy/ember';

module('Acceptance | School - Session Attributes', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    await setupAuthentication({ school: this.school });
  });

  test('check fields collapsed', async function (assert) {
    assert.expect(8);
    this.server.create('schoolConfig', {
      school: this.school,
      name: 'showSessionAttendanceRequired',
      value: false,
    });
    this.server.create('schoolConfig', {
      school: this.school,
      name: 'showSessionSupplemental',
      value: true,
    });
    await page.visit({ schoolId: this.school.id });
    await percySnapshot(assert);
    assert.strictEqual(
      page.manager.schoolSessionAttributes.collapsed.attendanceRequired.label,
      'Attendance Required',
    );
    assert.ok(page.manager.schoolSessionAttributes.collapsed.attendanceRequired.isDisabled);
    assert.strictEqual(
      page.manager.schoolSessionAttributes.collapsed.supplemental.label,
      'Supplemental Curriculum',
    );
    assert.ok(page.manager.schoolSessionAttributes.collapsed.supplemental.isEnabled);
    assert.strictEqual(
      page.manager.schoolSessionAttributes.collapsed.specialAttireRequired.label,
      'Special Attire Required',
    );
    assert.ok(page.manager.schoolSessionAttributes.collapsed.specialAttireRequired.isDisabled);
    assert.strictEqual(
      page.manager.schoolSessionAttributes.collapsed.specialEquipmentRequired.label,
      'Special Equipment Required',
    );
    assert.ok(page.manager.schoolSessionAttributes.collapsed.specialEquipmentRequired.isDisabled);
  });

  test('check fields expanded', async function (assert) {
    assert.expect(8);
    this.server.create('schoolConfig', {
      school: this.school,
      name: 'showSessionAttendanceRequired',
      value: false,
    });
    this.server.create('schoolConfig', {
      school: this.school,
      name: 'showSessionSupplemental',
      value: true,
    });
    await page.visit({ schoolId: this.school.id, schoolSessionAttributesDetails: true });
    await percySnapshot(assert);
    assert.strictEqual(
      page.manager.schoolSessionAttributes.expanded.attributes.attendanceRequired.label,
      'Attendance Required',
    );
    assert.ok(
      page.manager.schoolSessionAttributes.expanded.attributes.attendanceRequired.isDisabled,
    );
    assert.strictEqual(
      page.manager.schoolSessionAttributes.expanded.attributes.supplemental.label,
      'Supplemental Curriculum',
    );
    assert.ok(page.manager.schoolSessionAttributes.expanded.attributes.supplemental.isEnabled);
    assert.strictEqual(
      page.manager.schoolSessionAttributes.expanded.attributes.specialAttireRequired.label,
      'Special Attire Required',
    );
    assert.ok(
      page.manager.schoolSessionAttributes.expanded.attributes.specialAttireRequired.isDisabled,
    );
    assert.strictEqual(
      page.manager.schoolSessionAttributes.expanded.attributes.specialEquipmentRequired.label,
      'Special Equipment Required',
    );
    assert.ok(
      page.manager.schoolSessionAttributes.expanded.attributes.specialEquipmentRequired.isDisabled,
    );
  });

  test('manage session attributes', async function (assert) {
    assert.expect(16);
    this.server.create('schoolConfig', {
      school: this.school,
      name: 'showSessionAttendanceRequired',
      value: false,
    });
    this.server.create('schoolConfig', {
      school: this.school,
      name: 'showSessionSupplemental',
      value: true,
    });
    await page.visit({
      schoolId: this.school.id,
      schoolSessionAttributesDetails: true,
      schoolManageSessionAttributes: true,
    });
    await percySnapshot(assert);
    assert.strictEqual(
      page.manager.schoolSessionAttributes.expanded.manager.attendanceRequired.label,
      'Attendance Required',
    );
    assert.notOk(
      page.manager.schoolSessionAttributes.expanded.manager.attendanceRequired.isChecked,
    );
    assert.strictEqual(
      page.manager.schoolSessionAttributes.expanded.manager.supplemental.label,
      'Supplemental Curriculum',
    );
    assert.ok(page.manager.schoolSessionAttributes.expanded.manager.supplemental.isChecked);
    assert.strictEqual(
      page.manager.schoolSessionAttributes.expanded.manager.specialAttireRequired.label,
      'Special Attire Required',
    );
    assert.notOk(
      page.manager.schoolSessionAttributes.expanded.manager.specialAttireRequired.isChecked,
    );
    assert.strictEqual(
      page.manager.schoolSessionAttributes.expanded.manager.specialEquipmentRequired.label,
      'Special Equipment Required',
    );
    assert.notOk(
      page.manager.schoolSessionAttributes.expanded.manager.specialEquipmentRequired.isChecked,
    );
    await page.manager.schoolSessionAttributes.expanded.manager.attendanceRequired.check();
    await page.manager.schoolSessionAttributes.expanded.manager.supplemental.check();
    await page.manager.schoolSessionAttributes.expanded.manager.specialEquipmentRequired.check();
    await percySnapshot(assert);
    await page.manager.schoolSessionAttributes.expanded.save();
    assert.strictEqual(
      page.manager.schoolSessionAttributes.expanded.attributes.attendanceRequired.label,
      'Attendance Required',
    );
    assert.notOk(
      page.manager.schoolSessionAttributes.expanded.attributes.attendanceRequired.isDisabled,
    );
    assert.strictEqual(
      page.manager.schoolSessionAttributes.expanded.attributes.supplemental.label,
      'Supplemental Curriculum',
    );
    assert.notOk(page.manager.schoolSessionAttributes.expanded.attributes.supplemental.isEnabled);
    assert.strictEqual(
      page.manager.schoolSessionAttributes.expanded.attributes.specialAttireRequired.label,
      'Special Attire Required',
    );
    assert.ok(
      page.manager.schoolSessionAttributes.expanded.attributes.specialAttireRequired.isDisabled,
    );
    assert.strictEqual(
      page.manager.schoolSessionAttributes.expanded.attributes.specialEquipmentRequired.label,
      'Special Equipment Required',
    );
    assert.notOk(
      page.manager.schoolSessionAttributes.expanded.attributes.specialEquipmentRequired.isDisabled,
    );
  });
});
