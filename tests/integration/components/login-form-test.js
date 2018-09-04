import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { percySnapshot } from 'ember-percy';

module('Integration | Component | login-form', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`{{login-form}}`);
    percySnapshot(assert);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('no account exists error message', async function(assert) {
    const accountName = "Al"; // Al stands for Alex, sometimes.
    this.set("account", accountName);
    this.set("error", true);
    await render(hbs`{{login-form noAccountExistsError=error noAccountExistsAccount=account}}`);
    assert.equal(
      find('.error').textContent.trim(),
      `Your account ${accountName} does not match any user records in Ilios. If you need further assistance, please contact your school’s Ilios administrator.`);
  });
});
