import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { run } from '@ember/runloop';

module('Integration | Component | user profile roles', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.formerStudentRole = this.server.create('user-role', {
      title: 'Former Student'
    });
    this.studentRole = this.server.create('user-role', {
      title: 'Student'
    });
  });

  test('it renders', async function (assert) {
    const user = this.server.create('user', {
      root: false,
      roles: [this.studentRole],
    });
    const userModel = await run(() => this.owner.lookup('service:store').find('user', user.id));

    this.set('user', userModel);
    await render(hbs`{{user-profile-roles user=user}}`);
    const student = '[data-test-student] span';
    const formerStudent = '[data-test-former-student] span';
    const enabled = '[data-test-enabled] span';
    const syncIgnored = '[data-test-exclude-from-sync] span';
    const performsNonLearnerFunction = '[data-test-performs-non-learner-function] span';
    const learner = '[data-test-learner] span';
    const root = '[data-test-root] span';

    assert.equal(find(student).textContent.trim(), 'Yes', 'student shows status');
    assert.equal(find(formerStudent).textContent.trim(), 'No', 'former student shows status');
    assert.ok(find(formerStudent).classList.contains('no'), 'former student has right class');
    assert.equal(find(enabled).textContent.trim(), 'Yes', 'enabled shows status');
    assert.ok(find(enabled).classList.contains('yes'), 'enabled has right class');
    assert.equal(find(syncIgnored).textContent.trim(), 'No', 'sync ignored shows status');
    assert.ok(find(syncIgnored).classList.contains('no'), 'sync ignored has right class');

    assert.equal(find(performsNonLearnerFunction).textContent.trim(), 'No');
    assert.ok(find(performsNonLearnerFunction).classList.contains('no'));
    assert.equal(find(learner).textContent.trim(), 'No');
    assert.ok(find(learner).classList.contains('no'));
    assert.equal(find(root).textContent.trim(), 'No');
    assert.ok(find(root).classList.contains('no'));
  });

  // @link https://github.com/ilios/frontend/issues/3899
  test('check root flag', async function(assert) {
    const user = this.server.create('user', {
      root: true,
      roles: [this.studentRole],
    });
    const userModel = await run(() => this.owner.lookup('service:store').find('user', user.id));

    this.set('user', userModel);
    await render(hbs`{{user-profile-roles user=user}}`);
    const root = '[data-test-root] span';

    assert.equal(find(root).textContent.trim(), 'Yes');
    assert.ok(find(root).classList.contains('yes'));
  });

  test('clicking manage sends the action', async function(assert) {
    assert.expect(1);
    const user = this.server.create('user', {
      root: true,
      roles: [this.studentRole],
    });
    const userModel = await run(() => this.owner.lookup('service:store').find('user', user.id));
    this.set('user', userModel);
    this.set('click', (what) =>{
      assert.ok(what, 'recieved boolean true value');
    });
    await render(hbs`{{user-profile-roles user=user isManageable=true setIsManaging=(action click)}}`);
    const manage = 'button.manage';
    await click(manage);
  });

  test('can edit user roles', async function(assert) {
    assert.expect(8);
    const user = this.server.create('user', {
      root: true,
      roles: [this.studentRole],
    });
    const userModel = await run(() => this.owner.lookup('service:store').find('user', user.id));

    this.set('user', userModel);
    this.set('nothing', parseInt);

    await render(hbs`{{user-profile-roles isManaging=true user=user setIsManaging=(action nothing)}}`);
    let inputs = findAll('input');
    const formerStudent = '[data-test-former-student] input';
    const enabled = '[data-test-enabled] input';
    const syncIgnored = '[data-test-exclude-from-sync] input';

    assert.equal(inputs.length, 3);
    assert.notOk(find(formerStudent).checked);
    assert.ok(find(enabled).checked);
    assert.notOk(find(syncIgnored).checked);

    await click(formerStudent);
    await click(enabled);
    await click(syncIgnored);

    await click('.bigadd');

    assert.ok(userModel.hasMany('roles').ids().includes(this.studentRole.id));
    assert.ok(userModel.hasMany('roles').ids().includes(this.formerStudentRole.id));
    assert.equal(userModel.get('enabled'), false, 'user is disabled');
    assert.equal(userModel.get('userSyncIgnore'), true, 'user is sync ignored');
  });
});
