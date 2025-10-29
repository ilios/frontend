import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/school/emails-editor';
import EmailsEditor from 'frontend/components/school/emails-editor';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | school/emails-editor', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const school = this.server.create('school', {
      iliosAdministratorEmail: 'admin@school.edu',
      changeAlertRecipients: 'email1@school.edu, email2@school.edu',
    });
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    await render(
      <template>
        <EmailsEditor @school={{this.school}} @save={{(noop)}} @cancel={{(noop)}} />
      </template>,
    );
    assert.strictEqual(component.administratorEmail.value, 'admin@school.edu');
    assert.strictEqual(
      component.changeAlertRecipients.value,
      'email1@school.edu, email2@school.edu',
    );
  });

  test('save', async function (assert) {
    const school = this.server.create('school');
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    this.set('save', (administratorEmail, changeAlertRecipients) => {
      assert.step('save called');
      assert.strictEqual(administratorEmail, 'admin@school.edu');
      assert.strictEqual(changeAlertRecipients, 'email1@school.edu, email2@school.edu');
    });
    await render(
      <template>
        <EmailsEditor @school={{this.school}} @save={{this.save}} @cancel={{(noop)}} />
      </template>,
    );
    assert.strictEqual(component.administratorEmail.value, '');
    assert.strictEqual(component.changeAlertRecipients.value, '');
    assert.notOk(component.administratorEmail.hasError);
    assert.notOk(component.changeAlertRecipients.hasError);
    await component.administratorEmail.set('admin@school.edu');
    await component.changeAlertRecipients.set('email1@school.edu,email2@school.edu,,');
    await component.save();
    assert.notOk(component.administratorEmail.hasError);
    assert.notOk(component.changeAlertRecipients.hasError);
    assert.verifySteps(['save called']);
  });

  test('save with empty change alerts recipients', async function (assert) {
    const school = this.server.create('school', {
      iliosAdministratorEmail: 'admin@school.edu',
      changeAlertRecipients: 'email1@school.edu, email2@school.edu',
    });
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    this.set('save', (administratorEmail, changeAlertRecipients) => {
      assert.step('save called');
      assert.strictEqual(administratorEmail, 'admin@school.edu');
      assert.strictEqual(changeAlertRecipients, '');
    });
    await render(
      <template>
        <EmailsEditor @school={{this.school}} @save={{this.save}} @cancel={{(noop)}} />
      </template>,
    );
    assert.strictEqual(component.administratorEmail.value, 'admin@school.edu');
    assert.strictEqual(
      component.changeAlertRecipients.value,
      'email1@school.edu, email2@school.edu',
    );
    assert.notOk(component.administratorEmail.hasError);
    assert.notOk(component.changeAlertRecipients.hasError);
    await component.changeAlertRecipients.set('');
    await component.save();
    assert.notOk(component.administratorEmail.hasError);
    assert.notOk(component.changeAlertRecipients.hasError);
    assert.verifySteps(['save called']);
  });

  test('validation fails if given admin email is empty', async function (assert) {
    const school = this.server.create('school', {
      iliosAdministratorEmail: 'admin@school.edu',
      changeAlertRecipients: 'email1@school.edu, email2@school.edu',
    });
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    await render(
      <template>
        <EmailsEditor @school={{this.school}} @save={{(noop)}} @cancel={{(noop)}} />
      </template>,
    );
    assert.strictEqual(component.administratorEmail.value, 'admin@school.edu');
    assert.strictEqual(
      component.changeAlertRecipients.value,
      'email1@school.edu, email2@school.edu',
    );
    assert.notOk(component.administratorEmail.hasError);
    assert.notOk(component.changeAlertRecipients.hasError);
    await component.administratorEmail.set('');
    await component.save();
    assert.strictEqual(component.administratorEmail.error, 'Administrator Email can not be blank');
    assert.notOk(component.changeAlertRecipients.hasError);
  });

  test('validation fails if input contains invalid emails', async function (assert) {
    const school = this.server.create('school');
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    await render(
      <template>
        <EmailsEditor @school={{this.school}} @save={{(noop)}} @cancel={{(noop)}} />
      </template>,
    );
    assert.notOk(component.administratorEmail.hasError);
    assert.notOk(component.changeAlertRecipients.hasError);
    await component.administratorEmail.set('not an email');
    await component.changeAlertRecipients.set('email1@school.edu,not an email,email2@school.edu');
    await component.save();
    assert.strictEqual(
      component.administratorEmail.error,
      'Administrator Email must be a valid email address',
    );
    assert.strictEqual(
      component.changeAlertRecipients.error,
      'This list of change-alerts recipients contains invalid email addresses.',
    );
  });

  test('cancel', async function (assert) {
    const school = this.server.create('school');
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    this.set('cancel', () => {
      assert.step('cancel called');
    });
    await render(
      <template>
        <EmailsEditor @school={{this.school}} @save={{(noop)}} @cancel={{this.cancel}} />
      </template>,
    );
    await component.cancel();
    assert.verifySteps(['cancel called']);
  });

  test('save on enter in administrator email input', async function (assert) {
    const school = this.server.create('school');
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    this.set('save', (administratorEmail, changeAlertRecipients) => {
      assert.step('save called');
      assert.strictEqual(administratorEmail, 'admin@school.edu');
      assert.strictEqual(changeAlertRecipients, 'email1@school.edu, email2@school.edu');
    });
    await render(
      <template>
        <EmailsEditor @school={{this.school}} @save={{this.save}} @cancel={{(noop)}} />
      </template>,
    );
    await component.administratorEmail.set('admin@school.edu');
    await component.changeAlertRecipients.set('email1@school.edu, email2@school.edu');
    await component.administratorEmail.save();
    assert.verifySteps(['save called']);
  });

  test('save on enter in change-alerts recipients input', async function (assert) {
    const school = this.server.create('school');
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    this.set('save', (administratorEmail, changeAlertRecipients) => {
      assert.step('save called');
      assert.strictEqual(administratorEmail, 'admin@school.edu');
      assert.strictEqual(changeAlertRecipients, 'email1@school.edu, email2@school.edu');
    });
    await render(
      <template>
        <EmailsEditor @school={{this.school}} @save={{this.save}} @cancel={{(noop)}} />
      </template>,
    );
    await component.administratorEmail.set('admin@school.edu');
    await component.changeAlertRecipients.set('email1@school.edu, email2@school.edu');
    await component.changeAlertRecipients.save();
    assert.verifySteps(['save called']);
  });
});
