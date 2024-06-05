import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'frontend/tests/pages/components/school/emails-editor';

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
      hbs`<School::EmailsEditor @school={{this.school}} @save={{(noop)}} @cancel={{(noop)}} />`,
    );
    assert.strictEqual(component.administratorEmail.value, 'admin@school.edu');
    assert.strictEqual(
      component.changeAlertRecipients.value,
      'email1@school.edu, email2@school.edu',
    );
  });

  test('save', async function (assert) {
    assert.expect(8);
    const school = this.server.create('school');
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    this.set('save', (administratorEmail, changeAlertRecipients) => {
      assert.strictEqual(administratorEmail, 'admin@school.edu');
      assert.strictEqual(changeAlertRecipients, 'email1@school.edu, email2@school.edu');
    });
    await render(
      hbs`<School::EmailsEditor @school={{this.school}} @save={{this.save}} @cancel={{(noop)}} />`,
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
  });

  test('save with empty data', async function (assert) {
    assert.expect(8);
    const school = this.server.create('school', {
      iliosAdministratorEmail: 'admin@school.edu',
      changeAlertRecipients: 'email1@school.edu, email2@school.edu',
    });
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    this.set('save', (administratorEmail, changeAlertRecipients) => {
      assert.strictEqual(administratorEmail, '');
      assert.strictEqual(changeAlertRecipients, '');
    });
    await render(
      hbs`<School::EmailsEditor @school={{this.school}} @save={{this.save}} @cancel={{(noop)}} />`,
    );
    assert.strictEqual(component.administratorEmail.value, 'admin@school.edu');
    assert.strictEqual(
      component.changeAlertRecipients.value,
      'email1@school.edu, email2@school.edu',
    );
    assert.notOk(component.administratorEmail.hasError);
    assert.notOk(component.changeAlertRecipients.hasError);
    await component.administratorEmail.set('');
    await component.changeAlertRecipients.set('');
    await component.save();
    assert.notOk(component.administratorEmail.hasError);
    assert.notOk(component.changeAlertRecipients.hasError);
  });

  test('validation fails', async function (assert) {
    const school = this.server.create('school');
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    await render(
      hbs`<School::EmailsEditor @school={{this.school}} @save={{(noop)}} @cancel={{(noop)}} />`,
    );
    assert.notOk(component.administratorEmail.hasError);
    assert.notOk(component.changeAlertRecipients.hasError);
    await component.administratorEmail.set('not an email');
    await component.changeAlertRecipients.set('email1@school.edu,not an email,email2@school.edu');
    await component.save();
    assert.ok(component.administratorEmail.hasError);
    assert.ok(component.changeAlertRecipients.hasError);
  });

  test('cancel', async function (assert) {
    assert.expect(1);
    const school = this.server.create('school');
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    this.set('cancel', () => {
      assert.ok(true);
    });
    await render(
      hbs`<School::EmailsEditor @school={{this.school}} @save={{(noop)}} @cancel={{this.cancel}} />`,
    );
    await component.cancel();
  });

  test('save on enter in administrator email input', async function (assert) {
    assert.expect(2);
    const school = this.server.create('school');
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    this.set('save', (administratorEmail, changeAlertRecipients) => {
      assert.strictEqual(administratorEmail, 'admin@school.edu');
      assert.strictEqual(changeAlertRecipients, 'email1@school.edu, email2@school.edu');
    });
    await render(
      hbs`<School::EmailsEditor @school={{this.school}} @save={{this.save}} @cancel={{(noop)}} />`,
    );
    await component.administratorEmail.set('admin@school.edu');
    await component.changeAlertRecipients.set('email1@school.edu, email2@school.edu');
    await component.administratorEmail.save();
  });

  test('save on enter in change-alerts recipients input', async function (assert) {
    assert.expect(2);
    const school = this.server.create('school');
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    this.set('save', (administratorEmail, changeAlertRecipients) => {
      assert.strictEqual(administratorEmail, 'admin@school.edu');
      assert.strictEqual(changeAlertRecipients, 'email1@school.edu, email2@school.edu');
    });
    await render(
      hbs`<School::EmailsEditor @school={{this.school}} @save={{this.save}} @cancel={{(noop)}} />`,
    );
    await component.administratorEmail.set('admin@school.edu');
    await component.changeAlertRecipients.set('email1@school.edu, email2@school.edu');
    await component.changeAlertRecipients.save();
  });
});
