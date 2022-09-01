import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/user-profile-roles';

module('Integration | Component | user profile roles', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.formerStudentRole = this.server.create('user-role', {
      title: 'Former Student',
    });
    this.studentRole = this.server.create('user-role', {
      title: 'Student',
    });
  });

  test('it renders', async function (assert) {
    const user = this.server.create('user', {
      root: false,
      roles: [this.studentRole],
    });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);

    this.set('user', userModel);
    await render(hbs`<UserProfileRoles @user={{this.user}} />`);

    assert.strictEqual(component.student.value, 'Yes');
    assert.strictEqual(component.formerStudent.value, 'No');
    assert.strictEqual(component.enabled.value, 'Yes');
    assert.strictEqual(component.excludeFromSync.value, 'No');
    assert.ok(component.performsNonLearnerFunction.yesNo.no);
    assert.notOk(component.performsNonLearnerFunction.yesNo.yes);
    assert.ok(component.learner.yesNo.no);
    assert.notOk(component.learner.yesNo.yes);
    assert.ok(component.root.yesNo.no);
    assert.notOk(component.root.yesNo.yes);
  });

  // @link https://github.com/ilios/frontend/issues/3899
  test('check root flag', async function (assert) {
    const user = this.server.create('user', {
      root: true,
      roles: [this.studentRole],
    });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);

    this.set('user', userModel);
    await render(hbs`<UserProfileRoles @user={{this.user}} />`);

    assert.ok(component.root.yesNo.yes);
    assert.notOk(component.root.yesNo.no);
  });

  test('clicking manage sends the action', async function (assert) {
    assert.expect(1);
    const user = this.server.create('user', {
      root: true,
      roles: [this.studentRole],
    });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    this.set('user', userModel);
    this.set('click', (what) => {
      assert.ok(what, 'recieved boolean true value');
    });
    await render(
      hbs`<UserProfileRoles @user={{this.user}} @isManageable={{true}} @setIsManaging={{this.click}} />`
    );
    await component.manage.click();
  });

  test('can edit user roles', async function (assert) {
    assert.expect(7);
    const user = this.server.create('user', {
      root: true,
      roles: [this.studentRole],
    });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    this.set('user', userModel);
    await render(hbs`<UserProfileRoles @isManaging={{true}} @user={{this.user}} />`);

    assert.notOk(component.formerStudent.isChecked);
    assert.ok(component.enabled.isChecked);
    assert.notOk(component.excludeFromSync.isChecked);
    await component.formerStudent.check();
    await component.enabled.check();
    await component.excludeFromSync.check();
    await component.save.click();
    assert.ok(userModel.hasMany('roles').ids().includes(this.studentRole.id));
    assert.ok(userModel.hasMany('roles').ids().includes(this.formerStudentRole.id));
    assert.false(userModel.get('enabled'), 'user is disabled');
    assert.true(userModel.get('userSyncIgnore'), 'user is sync ignored');
  });
});
