import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'frontend/tests/pages/components/school/emails';

module('Integration | Component | school/emails', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const school = this.server.create('school', {
      iliosAdministratorEmail: 'admin@school.edu',
      changeAlertRecipients: 'email1@school.edu, email2@school.edu',
    });
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);

    this.set('school', schoolModel);

    await render(hbs`<School::Emails @school={{this.school}} @manage={{(noop)}}/>`);

    assert.strictEqual(component.title, 'Emails');
    assert.notOk(component.canManage);
    assert.strictEqual(component.changeAlertRecipients.label, 'Change-alert Recipients:');
    assert.strictEqual(
      component.changeAlertRecipients.value,
      'email1@school.edu, email2@school.edu',
    );
    assert.strictEqual(component.administratorEmail.label, 'Administrator Email:');
    assert.strictEqual(component.administratorEmail.value, 'admin@school.edu');
  });

  test('manage', async function (assert) {
    assert.expect(2);
    const school = this.server.create('school');
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);

    this.set('school', schoolModel);
    this.set('manage', () => {
      assert.ok(true, 'Manage event fired.');
    });

    await render(
      hbs`<School::Emails @school={{this.school}} @manage={{this.manage}} @canUpdate={{true}}/>`,
    );
    assert.ok(component.canManage);
    await component.manage();
  });
});
