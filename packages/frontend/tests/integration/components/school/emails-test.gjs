import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/school/emails';
import Emails from 'frontend/components/school/emails';
import noop from 'ilios-common/helpers/noop';

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

    await render(<template><Emails @school={{this.school}} @manage={{(noop)}} /></template>);

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
    const school = this.server.create('school');
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);

    this.set('school', schoolModel);
    this.set('manage', () => {
      assert.step('manage called');
    });

    await render(
      <template>
        <Emails @school={{this.school}} @manage={{this.manage}} @canUpdate={{true}} />
      </template>,
    );
    assert.ok(component.canManage);
    await component.manage();
    assert.verifySteps(['manage called']);
  });
});
