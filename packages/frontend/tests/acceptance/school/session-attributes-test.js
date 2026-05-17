import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest, takeScreenshot } from 'frontend/tests/helpers';
import page from 'frontend/tests/pages/school';

module('Acceptance | School - Session Attributes', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    this.school = await this.server.create('school');
    await setupAuthentication({ school: this.school }, true);
  });

  test('check fields collapsed', async function (assert) {
    await this.server.create('schoolConfig', {
      school: this.school,
      name: 'showSessionAttendanceRequired',
      value: false,
    });
    await this.server.create('schoolConfig', {
      school: this.school,
      name: 'showSessionSupplemental',
      value: true,
    });
    await page.visit({ schoolId: this.school.id });
    await takeScreenshot(assert);
    assert.strictEqual(
      page.root.sessionAttributes.collapsed.attendanceRequired.label,
      'Attendance Required',
    );
    assert.ok(page.root.sessionAttributes.collapsed.attendanceRequired.isDisabled);
    assert.strictEqual(
      page.root.sessionAttributes.collapsed.supplemental.label,
      'Supplemental Curriculum',
    );
    assert.ok(page.root.sessionAttributes.collapsed.supplemental.isEnabled);
    assert.strictEqual(
      page.root.sessionAttributes.collapsed.specialAttireRequired.label,
      'Special Attire Required',
    );
    assert.ok(page.root.sessionAttributes.collapsed.specialAttireRequired.isDisabled);
    assert.strictEqual(
      page.root.sessionAttributes.collapsed.specialEquipmentRequired.label,
      'Special Equipment Required',
    );
    assert.ok(page.root.sessionAttributes.collapsed.specialEquipmentRequired.isDisabled);
  });

  test('check fields expanded', async function (assert) {
    await this.server.create('schoolConfig', {
      school: this.school,
      name: 'showSessionAttendanceRequired',
      value: false,
    });
    await this.server.create('schoolConfig', {
      school: this.school,
      name: 'showSessionSupplemental',
      value: true,
    });
    await page.visit({ schoolId: this.school.id, schoolSessionAttributesDetails: true });
    await takeScreenshot(assert);
    assert.strictEqual(
      page.root.sessionAttributes.expanded.attributes.attendanceRequired.label,
      'Attendance Required',
    );
    assert.ok(page.root.sessionAttributes.expanded.attributes.attendanceRequired.isDisabled);
    assert.strictEqual(
      page.root.sessionAttributes.expanded.attributes.supplemental.label,
      'Supplemental Curriculum',
    );
    assert.ok(page.root.sessionAttributes.expanded.attributes.supplemental.isEnabled);
    assert.strictEqual(
      page.root.sessionAttributes.expanded.attributes.specialAttireRequired.label,
      'Special Attire Required',
    );
    assert.ok(page.root.sessionAttributes.expanded.attributes.specialAttireRequired.isDisabled);
    assert.strictEqual(
      page.root.sessionAttributes.expanded.attributes.specialEquipmentRequired.label,
      'Special Equipment Required',
    );
    assert.ok(page.root.sessionAttributes.expanded.attributes.specialEquipmentRequired.isDisabled);
  });

  test('manage session attributes', async function (assert) {
    await this.server.create('schoolConfig', {
      school: this.school,
      name: 'showSessionAttendanceRequired',
      value: false,
    });
    await this.server.create('schoolConfig', {
      school: this.school,
      name: 'showSessionSupplemental',
      value: true,
    });
    await page.visit({
      schoolId: this.school.id,
      schoolSessionAttributesDetails: true,
      schoolManageSessionAttributes: true,
    });
    await takeScreenshot(assert, 'default');
    assert.strictEqual(
      page.root.sessionAttributes.expanded.manager.attendanceRequired.label,
      'Attendance Required',
    );
    assert.notOk(page.root.sessionAttributes.expanded.manager.attendanceRequired.isChecked);
    assert.strictEqual(
      page.root.sessionAttributes.expanded.manager.supplemental.label,
      'Supplemental Curriculum',
    );
    assert.ok(page.root.sessionAttributes.expanded.manager.supplemental.isChecked);
    assert.strictEqual(
      page.root.sessionAttributes.expanded.manager.specialAttireRequired.label,
      'Special Attire Required',
    );
    assert.notOk(page.root.sessionAttributes.expanded.manager.specialAttireRequired.isChecked);
    assert.strictEqual(
      page.root.sessionAttributes.expanded.manager.specialEquipmentRequired.label,
      'Special Equipment Required',
    );
    assert.notOk(page.root.sessionAttributes.expanded.manager.specialEquipmentRequired.isChecked);
    await page.root.sessionAttributes.expanded.manager.attendanceRequired.check();
    await page.root.sessionAttributes.expanded.manager.supplemental.check();
    await page.root.sessionAttributes.expanded.manager.specialEquipmentRequired.check();
    await takeScreenshot(assert, 'session attributes checked');
    await page.root.sessionAttributes.expanded.save();
    assert.strictEqual(
      page.root.sessionAttributes.expanded.attributes.attendanceRequired.label,
      'Attendance Required',
    );
    assert.notOk(page.root.sessionAttributes.expanded.attributes.attendanceRequired.isDisabled);
    assert.strictEqual(
      page.root.sessionAttributes.expanded.attributes.supplemental.label,
      'Supplemental Curriculum',
    );
    assert.notOk(page.root.sessionAttributes.expanded.attributes.supplemental.isEnabled);
    assert.strictEqual(
      page.root.sessionAttributes.expanded.attributes.specialAttireRequired.label,
      'Special Attire Required',
    );
    assert.ok(page.root.sessionAttributes.expanded.attributes.specialAttireRequired.isDisabled);
    assert.strictEqual(
      page.root.sessionAttributes.expanded.attributes.specialEquipmentRequired.label,
      'Special Equipment Required',
    );
    assert.notOk(
      page.root.sessionAttributes.expanded.attributes.specialEquipmentRequired.isDisabled,
    );
  });
});
