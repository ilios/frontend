import ObjectProxy from '@ember/object/proxy';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/learner-group/user-manager';
import UserManager from 'frontend/components/learner-group/user-manager';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | learner-group/user-manager', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders when editing', async function (assert) {
    const learnerGroup = this.server.create('learner-group', { id: 1 });
    const user1 = this.server.create('user', {
      firstName: 'Jasper',
      lastName: 'Dog',
      campusId: '1234',
      email: 'testemail',
      enabled: true,
      learnerGroups: [learnerGroup],
    });
    const user2 = this.server.create('user', {
      firstName: 'Jackson',
      lastName: 'Doggy',
      campusId: '123',
      email: 'testemail2',
      enabled: false,
      learnerGroups: [learnerGroup],
    });
    const userModel1 = await this.owner.lookup('service:store').findRecord('user', user1.id);
    const userModel2 = await this.owner.lookup('service:store').findRecord('user', user2.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
    const userModelProxy1 = ObjectProxy.create({
      content: userModel1,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title,
    });
    const userModelProxy2 = ObjectProxy.create({
      content: userModel2,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title,
    });

    this.set('users', [userModelProxy1, userModelProxy2]);
    this.set('learnerGroup', learnerGroupModel);
    await render(
      <template>
        <UserManager
          @learnerGroupId={{this.learnerGroup.id}}
          @learnerGroupTitle="this group"
          @topLevelGroupTitle="top group"
          @cohortTitle="this cohort"
          @users={{this.users}}
          @sortBy="id"
          @setSortBy={{(noop)}}
          @addUserToGroup={{(noop)}}
          @removeUserFromGroup={{(noop)}}
          @addUsersToGroup={{(noop)}}
          @removeUsersFromGroup={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.groupMembers, 'Members of current group (2)');
    assert.strictEqual(component.allOtherMembers, 'All other members of top group (0)');
    assert.strictEqual(
      component.usersInCurrentGroup[0].name.userNameInfo.fullName,
      'Jasper M. Dog',
    );
    assert.ok(component.usersInCurrentGroup[0].name.isClickable);
    assert.ok(component.usersInCurrentGroup[0].campusId.isClickable);
    assert.ok(component.usersInCurrentGroup[0].email.isClickable);
    assert.notOk(component.usersInCurrentGroup[0].name.userStatus.accountIsDisabled);
    assert.ok(component.usersInCurrentGroup[0].canBeSelected);
    assert.notOk(component.usersInCurrentGroup[0].isSelected);
    assert.strictEqual(component.usersInCurrentGroup[0].campusId.text, '1234');
    assert.strictEqual(component.usersInCurrentGroup[0].email.text, 'testemail');
    assert.notOk(component.usersInCurrentGroup[0].name.userStatus.accountIsDisabled);
    assert.strictEqual(
      component.usersInCurrentGroup[1].name.userNameInfo.fullName,
      'Jackson M. Doggy',
    );
    assert.ok(component.usersInCurrentGroup[1].canBeSelected);
    assert.strictEqual(component.usersInCurrentGroup[1].campusId.text, '123');
    assert.strictEqual(component.usersInCurrentGroup[1].email.text, 'testemail2');
    assert.ok(component.usersInCurrentGroup[1].name.isClickable);
    assert.ok(component.usersInCurrentGroup[1].campusId.isClickable);
    assert.ok(component.usersInCurrentGroup[1].email.isClickable);
    assert.ok(component.usersInCurrentGroup[1].name.userStatus.accountIsDisabled);
  });

  test('sort by full name', async function (assert) {
    const learnerGroup = this.server.create('learner-group', { id: 1 });
    const user1 = this.server.create('user', {
      firstName: 'Jasper',
      learnerGroups: [learnerGroup],
    });
    const user2 = this.server.create('user', {
      firstName: 'Jackson',
      learnerGroups: [learnerGroup],
    });
    const user3 = this.server.create('user', {
      firstName: 'Jayden',
      displayName: 'Captain J',
      learnerGroups: [learnerGroup],
    });
    const userModel1 = await this.owner.lookup('service:store').findRecord('user', user1.id);
    const userModel2 = await this.owner.lookup('service:store').findRecord('user', user2.id);
    const userModel3 = await this.owner.lookup('service:store').findRecord('user', user3.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
    const userModelProxy1 = ObjectProxy.create({
      content: userModel1,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title,
    });
    const userModelProxy2 = ObjectProxy.create({
      content: userModel2,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title,
    });
    const userModelProxy3 = ObjectProxy.create({
      content: userModel3,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title,
    });

    this.set('users', [userModelProxy1, userModelProxy2, userModelProxy3]);
    this.set('learnerGroup', learnerGroupModel);
    await render(
      <template>
        <UserManager
          @learnerGroupId={{this.learnerGroup.Id}}
          @learnerGroupTitle="this group"
          @topLevelGroupTitle="top group"
          @cohortTitle="this cohort"
          @users={{this.users}}
          @sortBy="fullName"
          @setSortBy={{(noop)}}
          @addUserToGroup={{(noop)}}
          @removeUserFromGroup={{(noop)}}
          @addUsersToGroup={{(noop)}}
          @removeUsersFromGroup={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.usersNotInCurrentGroup.length, 3);
    assert.strictEqual(component.usersNotInCurrentGroup[0].name.userNameInfo.fullName, 'Captain J');
    assert.strictEqual(
      component.usersNotInCurrentGroup[1].name.userNameInfo.fullName,
      'Jackson M. Mc1son',
    );
    assert.strictEqual(
      component.usersNotInCurrentGroup[2].name.userNameInfo.fullName,
      'Jasper M. Mc0son',
    );
  });

  test('add multiple users', async function (assert) {
    assert.expect(5);
    const learnerGroup = this.server.create('learner-group', { id: 1 });
    const subGroup = this.server.create('learner-group', { parent: learnerGroup });
    const user = this.server.create('user', { enabled: true, learnerGroups: [subGroup] });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
    const subGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', subGroup.id);
    const userModelProxy = ObjectProxy.create({
      content: userModel,
      lowestGroupInTree: subGroupModel,
      lowestGroupInTreeTitle: subGroupModel.title,
    });

    this.set('users', [userModelProxy]);
    this.set('learnerGroup', learnerGroupModel);
    this.set('addMany', ([user]) => {
      assert.strictEqual(userModel, user);
    });
    await render(
      <template>
        <UserManager
          @learnerGroupId={{this.learnerGroup.id}}
          @learnerGroupTitle="this group"
          @topLevelGroupTitle="top group"
          @cohortTitle="this cohort"
          @users={{this.users}}
          @sortBy="id"
          @setSortBy={{(noop)}}
          @addUserToGroup={{(noop)}}
          @removeUserFromGroup={{(noop)}}
          @addUsersToGroup={{this.addMany}}
          @removeUsersFromGroup={{(noop)}}
        />
      </template>,
    );

    assert.notOk(component.membersCanBeAdded);
    await component.usersNotInCurrentGroup[0].select();
    assert.ok(component.membersCanBeAdded);
    assert.strictEqual(component.addButtonText, 'Move learner to this group');
    await component.add();
    assert.notOk(component.membersCanBeAdded);
  });

  test('remove multiple users', async function (assert) {
    assert.expect(5);
    const learnerGroup = this.server.create('learner-group', { id: 1 });
    const user = this.server.create('user', { enabled: true, learnerGroups: [learnerGroup] });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
    const userModelProxy = ObjectProxy.create({
      content: userModel,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title,
    });

    this.set('users', [userModelProxy]);
    this.set('learnerGroup', learnerGroupModel);
    this.set('removeMany', ([user]) => {
      assert.strictEqual(userModel, user);
    });
    await render(
      <template>
        <UserManager
          @learnerGroupId={{this.learnerGroup.id}}
          @learnerGroupTitle="this group"
          @topLevelGroupTitle="top group"
          @cohortTitle="this cohort"
          @users={{this.users}}
          @sortBy="id"
          @setSortBy={{(noop)}}
          @addUserToGroup={{(noop)}}
          @removeUserFromGroup={{(noop)}}
          @addUsersToGroup={{(noop)}}
          @removeUsersFromGroup={{this.removeMany}}
        />
      </template>,
    );

    assert.notOk(component.membersCanBeRemoved);
    await component.usersInCurrentGroup[0].select();
    assert.ok(component.membersCanBeRemoved);
    assert.strictEqual(component.removeButtonText, 'Remove learner to this cohort');
    await component.remove();
    assert.notOk(component.membersCanBeRemoved);
  });

  test('remove single user', async function (assert) {
    assert.expect(1);

    const learnerGroup = this.server.create('learner-group', { id: 1 });
    const user = this.server.create('user', { enabled: true, learnerGroups: [learnerGroup] });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
    const userModelProxy = ObjectProxy.create({
      content: userModel,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title,
    });

    this.set('users', [userModelProxy]);
    this.set('learnerGroup', learnerGroupModel);
    this.set('removeOne', (user) => {
      assert.strictEqual(userModel, user);
    });

    await render(
      <template>
        <UserManager
          @learnerGroupId={{this.learnerGroup.id}}
          @learnerGroupTitle="this group"
          @topLevelGroupTitle="top group"
          @cohortTitle="this cohort"
          @users={{this.users}}
          @sortBy="id"
          @setSortBy={{(noop)}}
          @addUserToGroup={{(noop)}}
          @removeUserFromGroup={{this.removeOne}}
          @addUsersToGroup={{(noop)}}
          @removeUsersFromGroup={{(noop)}}
        />
      </template>,
    );

    await component.usersInCurrentGroup[0].remove();
  });

  test('add single user', async function (assert) {
    assert.expect(1);

    const learnerGroup = this.server.create('learner-group', { id: 1 });
    const learnerGroup2 = this.server.create('learner-group', { id: 2 });
    const user = this.server.create('user', { enabled: true, learnerGroups: [learnerGroup2] });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
    const learnerGroupModel2 = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup2.id);
    const userModelProxy = ObjectProxy.create({
      content: userModel,
      lowestGroupInTree: learnerGroupModel2,
      lowestGroupInTreeTitle: learnerGroupModel2.title,
    });

    this.set('users', [userModelProxy]);
    this.set('learnerGroup', learnerGroupModel);
    this.set('addOne', (user) => {
      assert.strictEqual(userModel, user);
    });

    await render(
      <template>
        <UserManager
          @learnerGroupId={{this.learnerGroupModel.id}}
          @learnerGroupTitle="this group"
          @topLevelGroupTitle="top group"
          @cohortTitle="this cohort"
          @users={{this.users}}
          @sortBy="id"
          @setSortBy={{(noop)}}
          @addUserToGroup={{this.addOne}}
          @removeUserFromGroup={{(noop)}}
          @addUsersToGroup={{(noop)}}
          @removeUsersFromGroup={{(noop)}}
        />
      </template>,
    );
    await component.usersNotInCurrentGroup[0].add();
  });

  test('when users are selected single action is disabled', async function (assert) {
    const learnerGroup = this.server.create('learner-group', { id: 1 });
    const learnerGroup2 = this.server.create('learner-group', { id: 2 });
    const user = this.server.create('user', { enabled: true, learnerGroups: [learnerGroup] });
    const user2 = this.server.create('user', { enabled: true, learnerGroups: [learnerGroup2] });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    const userModel2 = await this.owner.lookup('service:store').findRecord('user', user2.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
    const learnerGroupModel2 = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup2.id);
    const userModelProxy = ObjectProxy.create({
      content: userModel,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title,
    });
    const userModelProxy2 = ObjectProxy.create({
      content: userModel2,
      lowestGroupInTree: learnerGroupModel2,
      lowestGroupInTreeTitle: learnerGroupModel2.title,
    });

    this.set('users', [userModelProxy, userModelProxy2]);
    this.set('learnerGroup', learnerGroupModel);
    await render(
      <template>
        <UserManager
          @learnerGroupId={{this.learnerGroup.id}}
          @learnerGroupTitle="this group"
          @topLevelGroupTitle="top group"
          @cohortTitle="this cohort"
          @users={{this.users}}
          @sortBy="id"
          @setSortBy={{(noop)}}
          @addUserToGroup={{(noop)}}
          @removeUserFromGroup={{(noop)}}
          @addUsersToGroup={{(noop)}}
          @removeUsersFromGroup={{(noop)}}
        />
      </template>,
    );

    assert.ok(component.usersInCurrentGroup[0].canBeRemoved);
    assert.ok(component.usersNotInCurrentGroup[0].canBeAdded);
    await component.usersInCurrentGroup[0].select();
    assert.notOk(component.usersInCurrentGroup[0].canBeRemoved);
    await component.usersNotInCurrentGroup[0].select();
    assert.notOk(component.usersNotInCurrentGroup[0].canBeAdded);
  });

  test('check all users in group', async function (assert) {
    assert.expect(7);
    const learnerGroup = this.server.create('learner-group', { id: 1 });
    const user = this.server.create('user', { enabled: true, learnerGroups: [learnerGroup] });
    const user2 = this.server.create('user', { enabled: true, learnerGroups: [learnerGroup] });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    const userModel2 = await this.owner.lookup('service:store').findRecord('user', user2.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
    const userModelProxy = ObjectProxy.create({
      content: userModel,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title,
    });
    const userModelProxy2 = ObjectProxy.create({
      content: userModel2,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title,
    });

    this.set('users', [userModelProxy, userModelProxy2]);
    this.set('removeMany', ([userA, userB]) => {
      assert.strictEqual(userModel, userA);
      assert.strictEqual(userModel2, userB);
    });
    this.set('learnerGroup', learnerGroupModel);

    await render(
      <template>
        <UserManager
          @learnerGroupId={{this.learnerGroup.id}}
          @learnerGroupTitle="this group"
          @topLevelGroupTitle="top group"
          @cohortTitle="this cohort"
          @users={{this.users}}
          @sortBy="id"
          @setSortBy={{(noop)}}
          @addUserToGroup={{(noop)}}
          @removeUserFromGroup={{(noop)}}
          @addUsersToGroup={{(noop)}}
          @removeUsersFromGroup={{this.removeMany}}
        />
      </template>,
    );
    assert.notOk(component.usersInCurrentGroup[0].isSelected);
    assert.notOk(component.usersInCurrentGroup[0].isSelected);
    await component.selectAllUsersInGroup.toggle();
    assert.ok(component.usersInCurrentGroup[0].isSelected);
    assert.ok(component.usersInCurrentGroup[0].isSelected);
    assert.strictEqual(component.removeButtonText, 'Remove 2 learners to this cohort');
    await component.remove();
  });

  test('check all users not in group', async function (assert) {
    assert.expect(7);
    const learnerGroup = this.server.create('learner-group', { id: 1 });
    const subGroup = this.server.create('learner-group', { parent: learnerGroup });
    const user = this.server.create('user', { enabled: true, learnerGroups: [subGroup] });
    const user2 = this.server.create('user', { enabled: true, learnerGroups: [subGroup] });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    const userModel2 = await this.owner.lookup('service:store').findRecord('user', user2.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
    const subGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', subGroup.id);
    const userModelProxy = ObjectProxy.create({
      content: userModel,
      lowestGroupInTree: subGroupModel,
      lowestGroupInTreeTitle: subGroupModel.title,
    });
    const userModelProxy2 = ObjectProxy.create({
      content: userModel2,
      lowestGroupInTree: subGroupModel,
      lowestGroupInTreeTitle: subGroupModel.title,
    });

    this.set('users', [userModelProxy, userModelProxy2]);
    this.set('addMany', ([userA, userB]) => {
      assert.strictEqual(userModel, userA);
      assert.strictEqual(userModel2, userB);
    });
    this.set('learnerGroup', learnerGroupModel);
    await render(
      <template>
        <UserManager
          @learnerGroupId={{this.learnerGroup.id}}
          @learnerGroupTitle="this group"
          @topLevelGroupTitle="top group"
          @cohortTitle="this cohort"
          @users={{this.users}}
          @sortBy="id"
          @setSortBy={{(noop)}}
          @addUserToGroup={{(noop)}}
          @removeUserFromGroup={{(noop)}}
          @addUsersToGroup={{this.addMany}}
          @removeUsersFromGroup={{(noop)}}
        />
      </template>,
    );
    assert.notOk(component.usersNotInCurrentGroup[0].isSelected);
    assert.notOk(component.usersNotInCurrentGroup[0].isSelected);
    await component.selectAllUsersNotInGroup.toggle();
    assert.ok(component.usersNotInCurrentGroup[0].isSelected);
    assert.ok(component.usersNotInCurrentGroup[0].isSelected);
    assert.strictEqual(component.addButtonText, 'Move 2 learners to this group');
    await component.add();
  });

  test('checking one puts checkall box into indeterminate state', async function (assert) {
    const learnerGroup = this.server.create('learner-group', { id: 1 });
    const user = this.server.create('user', { enabled: true, learnerGroups: [learnerGroup] });
    const user2 = this.server.create('user', { enabled: true, learnerGroups: [learnerGroup] });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    const userModel2 = await this.owner.lookup('service:store').findRecord('user', user2.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
    const userModelProxy = ObjectProxy.create({
      content: userModel,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title,
    });
    const userModelProxy2 = ObjectProxy.create({
      content: userModel2,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title,
    });

    this.set('users', [userModelProxy, userModelProxy2]);
    this.set('learnerGroup', learnerGroupModel);

    await render(
      <template>
        <UserManager
          @learnerGroupId={{this.learnerGroup.id}}
          @learnerGroupTitle="this group"
          @topLevelGroupTitle="top group"
          @cohortTitle="this cohort"
          @users={{this.users}}
          @sortBy="id"
          @setSortBy={{(noop)}}
          @addUserToGroup={{(noop)}}
          @removeUserFromGroup={{(noop)}}
          @addUsersToGroup={{(noop)}}
          @removeUsersFromGroup={{(noop)}}
        />
      </template>,
    );

    assert.notOk(component.usersInCurrentGroup[0].isSelected);
    assert.notOk(component.usersInCurrentGroup[1].isSelected);
    assert.notOk(component.selectAllUsersInGroup.isChecked);
    assert.notOk(component.selectAllUsersInGroup.isIndeterminate);
    await component.usersInCurrentGroup[0].select();
    assert.notOk(component.selectAllUsersInGroup.isChecked);
    assert.ok(component.selectAllUsersInGroup.isIndeterminate);
    await component.usersInCurrentGroup[1].select();
    assert.ok(component.selectAllUsersInGroup.isChecked);
    assert.notOk(component.selectAllUsersInGroup.isIndeterminate);
    assert.ok(component.usersInCurrentGroup[0].isSelected);
    assert.ok(component.usersInCurrentGroup[1].isSelected);
    await component.selectAllUsersInGroup.toggle();
    assert.notOk(component.usersInCurrentGroup[0].isSelected);
    assert.notOk(component.usersInCurrentGroup[1].isSelected);
  });

  test('filtering and bulk-selection of users in group', async function (assert) {
    const learnerGroup = this.server.create('learner-group', { id: 1 });
    const user1 = this.server.create('user', { enabled: true, displayName: 'Alpha' });
    const user2 = this.server.create('user', { enabled: true, displayName: 'Beta' });
    const user3 = this.server.create('user', { enabled: true, displayName: 'Gamma' });
    const userModel1 = await this.owner.lookup('service:store').findRecord('user', user1.id);
    const userModel2 = await this.owner.lookup('service:store').findRecord('user', user2.id);
    const userModel3 = await this.owner.lookup('service:store').findRecord('user', user3.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);

    const userModelProxy = ObjectProxy.create({
      content: userModel1,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title,
    });
    const userModelProxy2 = ObjectProxy.create({
      content: userModel2,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title,
    });

    const userModelProxy3 = ObjectProxy.create({
      content: userModel3,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title,
    });

    this.set('users', [userModelProxy, userModelProxy2, userModelProxy3]);
    this.set('learnerGroup', learnerGroupModel);

    await render(
      <template>
        <UserManager
          @learnerGroupId={{this.learnerGroup.id}}
          @learnerGroupTitle="this group"
          @topLevelGroupTitle="top group"
          @cohortTitle="this cohort"
          @users={{this.users}}
          @sortBy="id"
          @setSortBy={{(noop)}}
          @addUserToGroup={{(noop)}}
          @removeUserFromGroup={{(noop)}}
          @addUsersToGroup={{(noop)}}
          @removeUsersFromGroup={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.usersInCurrentGroup.length, 3);
    assert.strictEqual(component.usersInCurrentGroup[0].name.userNameInfo.fullName, 'Alpha');
    assert.strictEqual(component.usersInCurrentGroup[1].name.userNameInfo.fullName, 'Beta');
    assert.strictEqual(component.usersInCurrentGroup[2].name.userNameInfo.fullName, 'Gamma');
    assert.notOk(component.usersInCurrentGroup[0].isSelected);
    assert.notOk(component.usersInCurrentGroup[1].isSelected);
    assert.notOk(component.usersInCurrentGroup[2].isSelected);
    assert.notOk(component.selectAllUsersInGroup.isChecked);
    assert.notOk(component.selectAllUsersInGroup.isIndeterminate);

    await component.filter('Zzzz');
    assert.strictEqual(component.usersInCurrentGroup.length, 0);
    assert.notOk(component.selectAllUsersInGroup.isChecked);
    assert.notOk(component.selectAllUsersInGroup.isIndeterminate);

    await component.filter('');
    assert.strictEqual(component.usersInCurrentGroup.length, 3);
    assert.notOk(component.selectAllUsersInGroup.isChecked);
    assert.notOk(component.selectAllUsersInGroup.isIndeterminate);

    await component.usersInCurrentGroup[2].select();
    assert.notOk(component.selectAllUsersInGroup.isChecked);
    assert.ok(component.selectAllUsersInGroup.isIndeterminate);

    await component.filter('Alpha');
    assert.notOk(component.selectAllUsersInGroup.isChecked);
    assert.ok(component.selectAllUsersInGroup.isIndeterminate);
    assert.strictEqual(component.usersInCurrentGroup.length, 1);
    assert.strictEqual(component.usersInCurrentGroup[0].name.userNameInfo.fullName, 'Alpha');
    assert.notOk(component.usersInCurrentGroup[0].isSelected);

    await component.selectAllUsersInGroup.toggle();
    assert.ok(component.selectAllUsersInGroup.isChecked);
    assert.notOk(component.selectAllUsersInGroup.isIndeterminate);
    assert.ok(component.usersInCurrentGroup[0].isSelected);

    await component.filter('');
    assert.strictEqual(component.usersInCurrentGroup.length, 3);
    assert.notOk(component.selectAllUsersInGroup.isChecked);
    assert.ok(component.selectAllUsersInGroup.isIndeterminate);
    assert.ok(component.usersInCurrentGroup[0].isSelected);
    assert.notOk(component.usersInCurrentGroup[1].isSelected);
    assert.notOk(component.usersInCurrentGroup[2].isSelected);

    await component.selectAllUsersInGroup.toggle();
    assert.ok(component.selectAllUsersInGroup.isChecked);
    assert.notOk(component.selectAllUsersInGroup.isIndeterminate);
    assert.ok(component.usersInCurrentGroup[0].isSelected);
    assert.ok(component.usersInCurrentGroup[1].isSelected);
    assert.ok(component.usersInCurrentGroup[2].isSelected);

    await component.selectAllUsersInGroup.toggle();
    assert.notOk(component.selectAllUsersInGroup.isChecked);
    assert.notOk(component.selectAllUsersInGroup.isIndeterminate);
    assert.notOk(component.usersInCurrentGroup[0].isSelected);
    assert.notOk(component.usersInCurrentGroup[1].isSelected);
    assert.notOk(component.usersInCurrentGroup[2].isSelected);
  });

  test('filtering and bulk-selection of users not in group', async function (assert) {
    const learnerGroup = this.server.create('learner-group', { id: 1 });
    const subGroup = this.server.create('learner-group', { parent: learnerGroup });
    const user1 = this.server.create('user', { enabled: true, displayName: 'Alpha' });
    const user2 = this.server.create('user', { enabled: true, displayName: 'Beta' });
    const user3 = this.server.create('user', { enabled: true, displayName: 'Gamma' });
    const userModel1 = await this.owner.lookup('service:store').findRecord('user', user1.id);
    const userModel2 = await this.owner.lookup('service:store').findRecord('user', user2.id);
    const userModel3 = await this.owner.lookup('service:store').findRecord('user', user3.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
    const subGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', subGroup.id);

    const userModelProxy = ObjectProxy.create({
      content: userModel1,
      lowestGroupInTree: subGroupModel,
      lowestGroupInTreeTitle: subGroupModel.title,
    });
    const userModelProxy2 = ObjectProxy.create({
      content: userModel2,
      lowestGroupInTree: subGroupModel,
      lowestGroupInTreeTitle: subGroupModel.title,
    });

    const userModelProxy3 = ObjectProxy.create({
      content: userModel3,
      lowestGroupInTree: subGroupModel,
      lowestGroupInTreeTitle: subGroupModel.title,
    });

    this.set('users', [userModelProxy, userModelProxy2, userModelProxy3]);
    this.set('learnerGroup', learnerGroupModel);

    await render(
      <template>
        <UserManager
          @learnerGroupId={{this.learnerGroup.id}}
          @learnerGroupTitle="this group"
          @topLevelGroupTitle="top group"
          @cohortTitle="this cohort"
          @users={{this.users}}
          @sortBy="id"
          @setSortBy={{(noop)}}
          @addUserToGroup={{(noop)}}
          @removeUserFromGroup={{(noop)}}
          @addUsersToGroup={{(noop)}}
          @removeUsersFromGroup={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.usersNotInCurrentGroup.length, 3);
    assert.strictEqual(component.usersNotInCurrentGroup[0].name.userNameInfo.fullName, 'Alpha');
    assert.strictEqual(component.usersNotInCurrentGroup[1].name.userNameInfo.fullName, 'Beta');
    assert.strictEqual(component.usersNotInCurrentGroup[2].name.userNameInfo.fullName, 'Gamma');
    assert.notOk(component.usersNotInCurrentGroup[0].isSelected);
    assert.notOk(component.usersNotInCurrentGroup[1].isSelected);
    assert.notOk(component.usersNotInCurrentGroup[2].isSelected);
    assert.notOk(component.selectAllUsersNotInGroup.isChecked);
    assert.notOk(component.selectAllUsersNotInGroup.isIndeterminate);

    await component.filter('Zzzz');
    assert.strictEqual(component.usersNotInCurrentGroup.length, 0);
    assert.notOk(component.selectAllUsersNotInGroup.isChecked);
    assert.notOk(component.selectAllUsersNotInGroup.isIndeterminate);

    await component.filter('');
    assert.strictEqual(component.usersNotInCurrentGroup.length, 3);
    assert.notOk(component.selectAllUsersNotInGroup.isChecked);
    assert.notOk(component.selectAllUsersNotInGroup.isIndeterminate);

    await component.usersNotInCurrentGroup[2].select();
    assert.notOk(component.selectAllUsersNotInGroup.isChecked);
    assert.ok(component.selectAllUsersNotInGroup.isIndeterminate);

    await component.filter('Alpha');
    assert.notOk(component.selectAllUsersNotInGroup.isChecked);
    assert.ok(component.selectAllUsersNotInGroup.isIndeterminate);
    assert.strictEqual(component.usersNotInCurrentGroup.length, 1);
    assert.strictEqual(component.usersNotInCurrentGroup[0].name.userNameInfo.fullName, 'Alpha');
    assert.notOk(component.usersNotInCurrentGroup[0].isSelected);

    await component.selectAllUsersNotInGroup.toggle();
    assert.ok(component.selectAllUsersNotInGroup.isChecked);
    assert.notOk(component.selectAllUsersNotInGroup.isIndeterminate);
    assert.ok(component.usersNotInCurrentGroup[0].isSelected);

    await component.filter('');
    assert.strictEqual(component.usersNotInCurrentGroup.length, 3);
    assert.notOk(component.selectAllUsersNotInGroup.isChecked);
    assert.ok(component.selectAllUsersNotInGroup.isIndeterminate);
    assert.ok(component.usersNotInCurrentGroup[0].isSelected);
    assert.notOk(component.usersNotInCurrentGroup[1].isSelected);
    assert.notOk(component.usersNotInCurrentGroup[2].isSelected);

    await component.selectAllUsersNotInGroup.toggle();
    assert.ok(component.selectAllUsersNotInGroup.isChecked);
    assert.notOk(component.selectAllUsersNotInGroup.isIndeterminate);
    assert.ok(component.usersNotInCurrentGroup[0].isSelected);
    assert.ok(component.usersNotInCurrentGroup[1].isSelected);
    assert.ok(component.usersNotInCurrentGroup[2].isSelected);

    await component.selectAllUsersNotInGroup.toggle();
    assert.notOk(component.selectAllUsersNotInGroup.isChecked);
    assert.notOk(component.selectAllUsersNotInGroup.isIndeterminate);
    assert.notOk(component.usersNotInCurrentGroup[0].isSelected);
    assert.notOk(component.usersNotInCurrentGroup[1].isSelected);
    assert.notOk(component.usersNotInCurrentGroup[2].isSelected);
  });

  test('filter users', async function (assert) {
    const learnerGroup = this.server.create('learner-group', { id: 1 });
    const user1 = this.server.create('user', {
      firstName: 'Jasper',
      lastName: 'Dog',
      email: 'jasper.dog@example.edu',
      learnerGroups: [learnerGroup],
    });
    const user2 = this.server.create('user', {
      firstName: 'Jackson',
      lastName: 'Doggy',
      email: 'jackson.doggy@example.edu',
      learnerGroups: [learnerGroup],
    });
    const user3 = this.server.create('user', {
      firstName: 'Jayden',
      lastName: 'Pup',
      displayName: 'Just Jayden',
      email: 'jayden@example.edu',
      learnerGroups: [learnerGroup],
    });
    const userModel1 = await this.owner.lookup('service:store').findRecord('user', user1.id);
    const userModel2 = await this.owner.lookup('service:store').findRecord('user', user2.id);
    const userModel3 = await this.owner.lookup('service:store').findRecord('user', user3.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
    const userModelProxy1 = ObjectProxy.create({
      content: userModel1,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title,
    });
    const userModelProxy2 = ObjectProxy.create({
      content: userModel2,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title,
    });
    const userModelProxy3 = ObjectProxy.create({
      content: userModel3,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title,
    });

    this.set('users', [userModelProxy1, userModelProxy2, userModelProxy3]);
    this.set('learnerGroup', learnerGroupModel);
    await render(
      <template>
        <UserManager
          @learnerGroupId={{this.learnerGroup.id}}
          @learnerGroupTitle="this group"
          @topLevelGroupTitle="top group"
          @cohortTitle="this cohort"
          @users={{this.users}}
          @sortBy="id"
          @setSortBy={{(noop)}}
          @addUserToGroup={{(noop)}}
          @removeUserFromGroup={{(noop)}}
          @addUsersToGroup={{(noop)}}
          @removeUsersFromGroup={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.usersInCurrentGroup.length, 3);
    assert.strictEqual(
      component.usersInCurrentGroup[0].name.userNameInfo.fullName,
      'Jasper M. Dog',
    );
    assert.strictEqual(
      component.usersInCurrentGroup[1].name.userNameInfo.fullName,
      'Jackson M. Doggy',
    );
    assert.strictEqual(component.usersInCurrentGroup[2].name.userNameInfo.fullName, 'Just Jayden');
    await component.filter('Just');
    assert.strictEqual(component.usersInCurrentGroup[0].name.userNameInfo.fullName, 'Just Jayden');
    await component.filter(' Just     ');
    assert.strictEqual(component.usersInCurrentGroup[0].name.userNameInfo.fullName, 'Just Jayden');
    await component.filter('JASPER.DOG@EXAMPLE.EDU');
    assert.strictEqual(
      component.usersInCurrentGroup[0].name.userNameInfo.fullName,
      'Jasper M. Dog',
    );
    await component.filter('jasper d');
    assert.strictEqual(
      component.usersInCurrentGroup[0].name.userNameInfo.fullName,
      'Jasper M. Dog',
    );
  });

  test('user not in group: click on name', async function (assert) {
    const learnerGroup = this.server.create('learner-group', { id: 1 });
    const learnerGroup2 = this.server.create('learner-group', { id: 2 });
    const user = this.server.create('user', { enabled: true, learnerGroups: [learnerGroup2] });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
    const learnerGroupModel2 = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup2.id);
    const userModelProxy = ObjectProxy.create({
      content: userModel,
      lowestGroupInTree: learnerGroupModel2,
      lowestGroupInTreeTitle: learnerGroupModel2.title,
    });
    this.set('users', [userModelProxy]);
    this.set('learnerGroup', learnerGroupModel);

    await render(
      <template>
        <UserManager
          @learnerGroupId={{this.learnerGroupModel.id}}
          @learnerGroupTitle="this group"
          @topLevelGroupTitle="top group"
          @cohortTitle="this cohort"
          @users={{this.users}}
          @sortBy="id"
          @setSortBy={{(noop)}}
          @addUserToGroup={{(noop)}}
          @removeUserFromGroup={{(noop)}}
          @addUsersToGroup={{(noop)}}
          @removeUsersFromGroup={{(noop)}}
        />
      </template>,
    );

    assert.notOk(component.usersNotInCurrentGroup[0].isSelected);
    await component.usersNotInCurrentGroup[0].name.click();
    assert.ok(component.usersNotInCurrentGroup[0].isSelected);
  });

  test('user not in group: click on campus id', async function (assert) {
    const learnerGroup = this.server.create('learner-group', { id: 1 });
    const learnerGroup2 = this.server.create('learner-group', { id: 2 });
    const user = this.server.create('user', { enabled: true, learnerGroups: [learnerGroup2] });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
    const learnerGroupModel2 = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup2.id);
    const userModelProxy = ObjectProxy.create({
      content: userModel,
      lowestGroupInTree: learnerGroupModel2,
      lowestGroupInTreeTitle: learnerGroupModel2.title,
    });
    this.set('users', [userModelProxy]);
    this.set('learnerGroup', learnerGroupModel);

    await render(
      <template>
        <UserManager
          @learnerGroupId={{this.learnerGroupModel.id}}
          @learnerGroupTitle="this group"
          @topLevelGroupTitle="top group"
          @cohortTitle="this cohort"
          @users={{this.users}}
          @sortBy="id"
          @setSortBy={{(noop)}}
          @addUserToGroup={{(noop)}}
          @removeUserFromGroup={{(noop)}}
          @addUsersToGroup={{(noop)}}
          @removeUsersFromGroup={{(noop)}}
        />
      </template>,
    );

    assert.notOk(component.usersNotInCurrentGroup[0].isSelected);
    await component.usersNotInCurrentGroup[0].campusId.click();
    assert.ok(component.usersNotInCurrentGroup[0].isSelected);
  });

  test('user not in group: click on email', async function (assert) {
    const learnerGroup = this.server.create('learner-group', { id: 1 });
    const learnerGroup2 = this.server.create('learner-group', { id: 2 });
    const user = this.server.create('user', { enabled: true, learnerGroups: [learnerGroup2] });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
    const learnerGroupModel2 = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup2.id);
    const userModelProxy = ObjectProxy.create({
      content: userModel,
      lowestGroupInTree: learnerGroupModel2,
      lowestGroupInTreeTitle: learnerGroupModel2.title,
    });
    this.set('users', [userModelProxy]);
    this.set('learnerGroup', learnerGroupModel);

    await render(
      <template>
        <UserManager
          @learnerGroupId={{this.learnerGroupModel.id}}
          @learnerGroupTitle="this group"
          @topLevelGroupTitle="top group"
          @cohortTitle="this cohort"
          @users={{this.users}}
          @sortBy="id"
          @setSortBy={{(noop)}}
          @addUserToGroup={{(noop)}}
          @removeUserFromGroup={{(noop)}}
          @addUsersToGroup={{(noop)}}
          @removeUsersFromGroup={{(noop)}}
        />
      </template>,
    );

    assert.notOk(component.usersNotInCurrentGroup[0].isSelected);
    await component.usersNotInCurrentGroup[0].email.click();
    assert.ok(component.usersNotInCurrentGroup[0].isSelected);
  });

  test('user in group: click on name', async function (assert) {
    const learnerGroup = this.server.create('learner-group', { id: 1 });
    const user = this.server.create('user', { enabled: true, learnerGroups: [learnerGroup] });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
    const userModelProxy = ObjectProxy.create({
      content: userModel,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title,
    });
    this.set('users', [userModelProxy]);
    this.set('learnerGroup', learnerGroupModel);

    await render(
      <template>
        <UserManager
          @learnerGroupId={{this.learnerGroup.id}}
          @learnerGroupTitle="this group"
          @topLevelGroupTitle="top group"
          @cohortTitle="this cohort"
          @users={{this.users}}
          @sortBy="id"
          @setSortBy={{(noop)}}
          @addUserToGroup={{(noop)}}
          @removeUserFromGroup={{(noop)}}
          @addUsersToGroup={{(noop)}}
          @removeUsersFromGroup={{(noop)}}
        />
      </template>,
    );

    assert.notOk(component.usersInCurrentGroup[0].isSelected);
    await component.usersInCurrentGroup[0].name.click();
    assert.ok(component.usersInCurrentGroup[0].isSelected);
  });

  test('user in group: click on campus id', async function (assert) {
    const learnerGroup = this.server.create('learner-group', { id: 1 });
    const user = this.server.create('user', { enabled: true, learnerGroups: [learnerGroup] });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
    const userModelProxy = ObjectProxy.create({
      content: userModel,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title,
    });
    this.set('users', [userModelProxy]);
    this.set('learnerGroup', learnerGroupModel);

    await render(
      <template>
        <UserManager
          @learnerGroupId={{this.learnerGroup.id}}
          @learnerGroupTitle="this group"
          @topLevelGroupTitle="top group"
          @cohortTitle="this cohort"
          @users={{this.users}}
          @sortBy="id"
          @setSortBy={{(noop)}}
          @addUserToGroup={{(noop)}}
          @removeUserFromGroup={{(noop)}}
          @addUsersToGroup={{(noop)}}
          @removeUsersFromGroup={{(noop)}}
        />
      </template>,
    );

    assert.notOk(component.usersInCurrentGroup[0].isSelected);
    await component.usersInCurrentGroup[0].campusId.click();
    assert.ok(component.usersInCurrentGroup[0].isSelected);
  });

  test('user in group: click on email', async function (assert) {
    const learnerGroup = this.server.create('learner-group', { id: 1 });
    const user = this.server.create('user', { enabled: true, learnerGroups: [learnerGroup] });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
    const userModelProxy = ObjectProxy.create({
      content: userModel,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title,
    });
    this.set('users', [userModelProxy]);
    this.set('learnerGroup', learnerGroupModel);

    await render(
      <template>
        <UserManager
          @learnerGroupId={{this.learnerGroup.id}}
          @learnerGroupTitle="this group"
          @topLevelGroupTitle="top group"
          @cohortTitle="this cohort"
          @users={{this.users}}
          @sortBy="id"
          @setSortBy={{(noop)}}
          @addUserToGroup={{(noop)}}
          @removeUserFromGroup={{(noop)}}
          @addUsersToGroup={{(noop)}}
          @removeUsersFromGroup={{(noop)}}
        />
      </template>,
    );

    assert.notOk(component.usersInCurrentGroup[0].isSelected);
    await component.usersInCurrentGroup[0].email.click();
    assert.ok(component.usersInCurrentGroup[0].isSelected);
  });

  test('learner-group hierarchy is shown in group-title and aria-label', async function (assert) {
    const parentGroup = this.server.create('learner-group');
    const learnerGroup = this.server.create('learner-group', { parent: parentGroup });
    const childGroup = this.server.create('learner-group', { parent: learnerGroup });
    const user1 = this.server.create('user', {
      learnerGroups: [learnerGroup],
    });
    const user2 = this.server.create('user', {
      learnerGroups: [childGroup],
    });
    const userModel1 = await this.owner.lookup('service:store').findRecord('user', user1.id);
    const userModel2 = await this.owner.lookup('service:store').findRecord('user', user2.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
    const childGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', childGroup.id);
    const userModelProxy1 = ObjectProxy.create({
      content: userModel1,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title,
    });
    const userModelProxy2 = ObjectProxy.create({
      content: userModel2,
      lowestGroupInTree: childGroupModel,
      lowestGroupInTreeTitle: childGroupModel.title,
    });

    this.set('users', [userModelProxy1, userModelProxy2]);
    this.set('learnerGroup', learnerGroupModel);
    await render(
      <template>
        <UserManager
          @learnerGroupId={{this.learnerGroup.id}}
          @learnerGroupTitle="this group"
          @topLevelGroupTitle="top group"
          @cohortTitle="this cohort"
          @users={{this.users}}
          @sortBy="id"
          @setSortBy={{(noop)}}
          @addUserToGroup={{(noop)}}
          @removeUserFromGroup={{(noop)}}
          @addUsersToGroup={{(noop)}}
          @removeUsersFromGroup={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.usersInCurrentGroup.length, 1);
    assert.strictEqual(
      component.usersInCurrentGroup[0].learnerGroup.linkTitle,
      'learner group 0 > learner group 1',
    );
    assert.strictEqual(
      component.usersInCurrentGroup[0].learnerGroup.linkAriaLabel,
      'learner group 0 > learner group 1',
    );
    assert.strictEqual(component.usersNotInCurrentGroup.length, 1);
    assert.strictEqual(
      component.usersNotInCurrentGroup[0].learnerGroup.linkTitle,
      'learner group 0 > learner group 1 > learner group 2',
    );
    assert.strictEqual(
      component.usersNotInCurrentGroup[0].learnerGroup.linkAriaLabel,
      'learner group 0 > learner group 1 > learner group 2',
    );
  });
});
