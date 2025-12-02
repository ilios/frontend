import { module, test } from 'qunit';
import { currentURL } from '@ember/test-helpers';
import { setupApplicationTest, takeScreenshot } from 'frontend/tests/helpers';
import { setupAuthentication } from 'ilios-common';
import page from 'frontend/tests/pages/school';
import percySnapshot from '@percy/ember';

module('Acceptance | school/emails', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    this.school = this.server.create('school', {
      iliosAdministratorEmail: 'admin@school.edu',
      changeAlertRecipients: 'email1@school.edu, email2@school.edu',
    });
    await setupAuthentication({ administeredSchools: [this.school] });
  });

  test('view', async function (assert) {
    await page.visit({ schoolId: this.school.id });
    assert.strictEqual(currentURL(), '/schools/1');
    await takeScreenshot(assert);
    await percySnapshot(assert);
    const { emails: c } = page.manager;

    assert.strictEqual(c.title, 'Emails');
    assert.ok(c.canManage);
    assert.strictEqual(c.changeAlertRecipients.label, 'Change-alert Recipients:');
    assert.strictEqual(c.changeAlertRecipients.value, 'email1@school.edu, email2@school.edu');
    assert.strictEqual(c.administratorEmail.label, 'Administrator Email:');
    assert.strictEqual(c.administratorEmail.value, 'admin@school.edu');
  });

  test('manage', async function (assert) {
    await page.visit({ schoolId: this.school.id, schoolManageEmails: true });
    await takeScreenshot(assert);
    await percySnapshot(assert);
    const { emailsEditor: c } = page.manager;

    await c.administratorEmail.set('new-admin@school.edu');
    await c.changeAlertRecipients.set('third@school.edu');
    await c.save();

    const { emails } = page.manager;

    assert.strictEqual(emails.administratorEmail.value, 'new-admin@school.edu');
    assert.strictEqual(emails.changeAlertRecipients.value, 'third@school.edu');
  });
});
