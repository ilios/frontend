import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest, takeScreenshot } from 'frontend/tests/helpers';
import page from 'frontend/tests/pages/my-profile';

module('Acceptance | My Profile', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    this.school = await this.server.create('school');
  });

  test('Student Theme Chooser', async function (assert) {
    const studentRole = await this.server.create('user-role', {
      title: 'Student',
    });
    await setupAuthentication({
      school: this.school,
      roles: [studentRole],
    });
    await page.visit();
    assert.ok(page.profile.userIsStudent);
    assert.strictEqual(page.profile.themeChooser.choices.length, 3);
    assert.strictEqual(page.profile.themeChooser.choices[0].images.studentPreviews.length, 2);
    assert.strictEqual(page.profile.themeChooser.choices[1].images.studentPreviews.length, 1);
    assert.strictEqual(page.profile.themeChooser.choices[2].images.studentPreviews.length, 1);

    await takeScreenshot(assert);
  });

  test('Non Student Theme Chooser', async function (assert) {
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    await page.visit();
    assert.notOk(page.profile.userIsStudent);
    assert.strictEqual(page.profile.themeChooser.choices.length, 3);
    assert.strictEqual(page.profile.themeChooser.choices[0].images.nonStudentPreviews.length, 4);
    assert.strictEqual(page.profile.themeChooser.choices[1].images.nonStudentPreviews.length, 2);
    assert.strictEqual(page.profile.themeChooser.choices[2].images.nonStudentPreviews.length, 2);

    await takeScreenshot(assert);
  });
});
