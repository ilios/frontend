import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios/tests/pages/components/pending-single-user-update';
import a11yAudit from 'ember-a11y-testing/test-support/audit';

module('Integration | Component | pending single user update', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders missing from directory', async function (assert) {
    const user = this.server.create('user', {
      email: 'user-email',
    });
    this.server.create('pending-user-update', {
      user,
      type: 'missingFromDirectory',
    });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);

    this.set('user', userModel);
    await render(hbs`<PendingSingleUserUpdate @user={{this.user}} />`);
    assert.strictEqual(component.updates.length, 1);
    assert.strictEqual(
      component.updates[0].explanation,
      'Unable to find user in the directory, please update, disable, or exclude their account from synchronization.'
    );
    assert.notOk(component.updates[0].hasUpdateEmailButton);

    a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders email update', async function (assert) {
    const user = this.server.create('user', {
      email: 'user-email',
    });
    this.server.create('pending-user-update', {
      user,
      type: 'emailMismatch',
      value: 'directory-email',
    });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);

    this.set('user', userModel);
    await render(hbs`<PendingSingleUserUpdate @user={{this.user}} />`);
    assert.strictEqual(component.updates.length, 1);
    assert.strictEqual(
      component.updates[0].explanation,
      'The email address in the directory (directory-email) does not match the email in ilios (user-email).'
    );
    assert.ok(component.updates[0].hasUpdateEmailButton);

    a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('Update email to match', async function (assert) {
    const user = this.server.create('user', {
      email: 'user-email',
    });
    this.server.create('pending-user-update', {
      user,
      type: 'emailMismatch',
      value: 'directory-email',
    });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);

    assert.strictEqual(this.server.db.users[0].email, 'user-email');
    assert.strictEqual(this.server.db.pendingUserUpdates.length, 1);
    this.set('user', userModel);
    await render(hbs`<PendingSingleUserUpdate @user={{this.user}} />`);
    assert.strictEqual(component.updates.length, 1);
    assert.ok(component.updates[0].hasUpdateEmailButton);
    await component.updates[0].updateEmail();
    assert.strictEqual(this.server.db.users[0].email, 'directory-email');
    assert.strictEqual(this.server.db.pendingUserUpdates.length, 0);

    a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('Disable User', async function (assert) {
    const user = this.server.create('user', {
      email: 'user-email',
    });
    this.server.create('pending-user-update', {
      user,
      type: 'emailMismatch',
      value: 'directory-email',
    });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);

    assert.ok(this.server.db.users[0].enabled);
    assert.strictEqual(this.server.db.pendingUserUpdates.length, 1);
    this.set('user', userModel);
    await render(hbs`<PendingSingleUserUpdate @user={{this.user}} />`);
    assert.strictEqual(component.updates.length, 1);
    assert.ok(component.updates[0].hasUpdateEmailButton);
    await component.updates[0].disable();
    assert.notOk(this.server.db.users[0].enabled);
    assert.strictEqual(this.server.db.pendingUserUpdates.length, 0);

    a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('Exclude from sync', async function (assert) {
    const user = this.server.create('user', {
      email: 'user-email',
    });
    this.server.create('pending-user-update', {
      user,
      type: 'emailMismatch',
      value: 'directory-email',
    });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);

    assert.notOk(this.server.db.users[0].userSyncIgnore);
    assert.strictEqual(this.server.db.pendingUserUpdates.length, 1);
    this.set('user', userModel);
    await render(hbs`<PendingSingleUserUpdate @user={{this.user}} />`);
    assert.strictEqual(component.updates.length, 1);
    assert.ok(component.updates[0].hasUpdateEmailButton);
    await component.updates[0].excludeFromSync();
    assert.ok(this.server.db.users[0].userSyncIgnore);
    assert.strictEqual(this.server.db.pendingUserUpdates.length, 0);

    a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
