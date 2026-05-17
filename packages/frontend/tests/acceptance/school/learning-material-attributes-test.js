import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest, takeScreenshot } from 'frontend/tests/helpers';
import page from 'frontend/tests/pages/school';

module('Acceptance | School - Learning Material Attributes', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    this.school = await this.server.create('school');
    await setupAuthentication({ school: this.school }, true);
  });

  test('check fields collapsed', async function (assert) {
    await this.server.create('schoolConfig', {
      school: this.school,
      name: 'learningMaterialAccessibilityRequired',
      value: false,
    });
    await this.server.create('schoolConfig', {
      school: this.school,
      name: 'learningMaterialAccessibilityRequirementsLink',
      value: '',
    });
    await page.visit({ schoolId: this.school.id });
    await takeScreenshot(assert);
    assert.strictEqual(
      page.root.learningMaterialAttributes.collapsed.accessibilityRequired.label,
      'Accessibility Required',
    );
    assert.ok(page.root.learningMaterialAttributes.collapsed.accessibilityRequired.isDisabled);
    assert.strictEqual(
      page.root.learningMaterialAttributes.collapsed.accessibilityRequirementsLink.label,
      'Accessibility Requirements Link',
    );
    assert.strictEqual(
      page.root.learningMaterialAttributes.collapsed.accessibilityRequirementsLink.link,
      '',
    );
  });

  test('check fields expanded', async function (assert) {
    await this.server.create('schoolConfig', {
      school: this.school,
      name: 'learningMaterialAccessibilityRequired',
      value: false,
    });
    await this.server.create('schoolConfig', {
      school: this.school,
      name: 'learningMaterialAccessibilityRequirementsLink',
      value: '',
    });
    await page.visit({ schoolId: this.school.id, schoolLearningMaterialAttributesDetails: true });
    await takeScreenshot(assert);
    assert.strictEqual(
      page.root.learningMaterialAttributes.expanded.attributes.accessibilityRequired.label,
      'Accessibility Required',
    );
    assert.ok(
      page.root.learningMaterialAttributes.expanded.attributes.accessibilityRequired.isDisabled,
    );
    assert.strictEqual(
      page.root.learningMaterialAttributes.expanded.attributes.accessibilityRequirementsLink.label,
      'Accessibility Requirements Link',
    );
    assert.strictEqual(
      page.root.learningMaterialAttributes.expanded.attributes.accessibilityRequirementsLink.link,
      '',
    );
  });

  test('manage learning material attributes', async function (assert) {
    await this.server.create('schoolConfig', {
      school: this.school,
      name: 'learningMaterialAccessibilityRequired',
      value: false,
    });
    await this.server.create('schoolConfig', {
      school: this.school,
      name: 'learningMaterialAccessibilityRequirementLink',
      value: '',
    });
    await page.visit({
      schoolId: this.school.id,
      schoolLearningMaterialAttributesDetails: true,
      schoolManageLearningMaterialAttributes: true,
    });
    await takeScreenshot(assert, 'default');
    assert.strictEqual(
      page.root.learningMaterialAttributes.expanded.manager.accessibilityRequired.label,
      'Accessibility Required',
      'required attribute label correct',
    );
    assert.notOk(
      page.root.learningMaterialAttributes.expanded.manager.accessibilityRequired.isChecked,
      'required attribute value is not checked',
    );
    assert.strictEqual(
      page.root.learningMaterialAttributes.expanded.manager.accessibilityRequirementsLink.label,
      'Accessibility Requirements Link',
      'requirements link attribute label correct',
    );
    assert.strictEqual(
      page.root.learningMaterialAttributes.expanded.manager.accessibilityRequirementsLink.link,
      undefined,
      'requirements link is empty',
    );
    await page.root.learningMaterialAttributes.expanded.manager.accessibilityRequired.check();
    await page.root.learningMaterialAttributes.expanded.manager.accessibilityRequirementsLink.update(
      'https://iliosproject.org',
    );
    await takeScreenshot(assert, 'learning material attributes checked and filled out');
    await page.root.learningMaterialAttributes.expanded.save();
    assert.strictEqual(
      page.root.learningMaterialAttributes.expanded.attributes.accessibilityRequired.label,
      'Accessibility Required',
    );
    assert.notOk(
      page.root.learningMaterialAttributes.expanded.attributes.accessibilityRequired.isDisabled,
    );
    assert.strictEqual(
      page.root.learningMaterialAttributes.expanded.attributes.accessibilityRequirementsLink.label,
      'Accessibility Requirements Link',
    );
    assert.strictEqual(
      page.root.learningMaterialAttributes.expanded.attributes.accessibilityRequirementsLink.link,
      'https://iliosproject.org',
    );
  });
});
