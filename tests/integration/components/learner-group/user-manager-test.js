import Service from '@ember/service';
import ObjectProxy from '@ember/object/proxy';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/learner-group/user-manager';

module('Integration | Component | learner-group/user-manager', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const learnerGroup = this.server.create('learnerGroup', { id: 1 });
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
    const userModel1 = await this.owner.lookup('service:store').find('user', user1.id);
    const userModel2 = await this.owner.lookup('service:store').find('user', user2.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .find('learner-group', learnerGroup.id);
    // @todo gross! see if proxy can be eliminated in upstream component <LearnergroupSummary> [ ST 2020/08/07 ]
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
    await render(hbs`<LearnerGroup::UserManager
      @learnerGroupId={{this.learnerGroup.id}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top group"
      @cohortTitle="this cohort"
      @users={{this.users}}
      @sortBy="id"
      @setSortBy={{(noop)}}
      @isEditing={{false}}
      @addUserToGroup={{(noop)}}
      @removeUserFromGroup={{(noop)}}
      @addUsersToGroup={{(noop)}}
      @removeUsersFromGroup={{(noop)}}
    />`);
    assert.strictEqual(component.usersInCurrentGroup.length, 2);
    assert.strictEqual(
      component.usersInCurrentGroup[0].name.userNameInfo.fullName,
      'Jasper M. Dog'
    );
    assert.strictEqual(component.usersInCurrentGroup[0].campusId.text, '1234');
    assert.strictEqual(component.usersInCurrentGroup[0].email.text, 'testemail');
    assert.notOk(component.usersInCurrentGroup[0].name.isClickable);
    assert.notOk(component.usersInCurrentGroup[0].campusId.isClickable);
    assert.notOk(component.usersInCurrentGroup[0].email.isClickable);
    assert.notOk(component.usersInCurrentGroup[0].isDisabled);
    assert.strictEqual(
      component.usersInCurrentGroup[1].name.userNameInfo.fullName,
      'Jackson M. Doggy'
    );
    assert.strictEqual(component.usersInCurrentGroup[1].campusId.text, '123');
    assert.strictEqual(component.usersInCurrentGroup[1].email.text, 'testemail2');
    assert.notOk(component.usersInCurrentGroup[1].name.isClickable);
    assert.notOk(component.usersInCurrentGroup[1].campusId.isClickable);
    assert.notOk(component.usersInCurrentGroup[1].email.isClickable);
    assert.ok(component.usersInCurrentGroup[1].isDisabled);
  });

  test('it renders when editing', async function (assert) {
    const learnerGroup = this.server.create('learnerGroup', { id: 1 });
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
    const userModel1 = await this.owner.lookup('service:store').find('user', user1.id);
    const userModel2 = await this.owner.lookup('service:store').find('user', user2.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .find('learner-group', learnerGroup.id);
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
    await render(hbs`<LearnerGroup::UserManager
      @learnerGroupId={{this.learnerGroup.id}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top group"
      @cohortTitle="this cohort"
      @users={{this.users}}
      @sortBy="id"
      @setSortBy={{(noop)}}
      @isEditing={{true}}
      @addUserToGroup={{(noop)}}
      @removeUserFromGroup={{(noop)}}
      @addUsersToGroup={{(noop)}}
      @removeUsersFromGroup={{(noop)}}
    />`);

    assert.strictEqual(component.groupMembers, 'Members of current group (2)');
    assert.strictEqual(component.allOtherMembers, 'All other members of top group (0)');
    assert.strictEqual(
      component.usersInCurrentGroup[0].name.userNameInfo.fullName,
      'Jasper M. Dog'
    );
    assert.ok(component.usersInCurrentGroup[0].name.isClickable);
    assert.ok(component.usersInCurrentGroup[0].campusId.isClickable);
    assert.ok(component.usersInCurrentGroup[0].email.isClickable);
    assert.notOk(component.usersInCurrentGroup[0].isDisabled);
    assert.ok(component.usersInCurrentGroup[0].canBeSelected);
    assert.notOk(component.usersInCurrentGroup[0].isSelected);
    assert.strictEqual(component.usersInCurrentGroup[0].campusId.text, '1234');
    assert.strictEqual(component.usersInCurrentGroup[0].email.text, 'testemail');
    assert.notOk(component.usersInCurrentGroup[0].isDisabled);
    assert.strictEqual(
      component.usersInCurrentGroup[1].name.userNameInfo.fullName,
      'Jackson M. Doggy'
    );
    assert.notOk(component.usersInCurrentGroup[1].canBeSelected);
    assert.strictEqual(component.usersInCurrentGroup[1].campusId.text, '123');
    assert.strictEqual(component.usersInCurrentGroup[1].email.text, 'testemail2');
    assert.notOk(component.usersInCurrentGroup[1].name.isClickable);
    assert.notOk(component.usersInCurrentGroup[1].campusId.isClickable);
    assert.notOk(component.usersInCurrentGroup[1].email.isClickable);
    assert.ok(component.usersInCurrentGroup[1].isDisabled);
  });

  test('sort by full name', async function (assert) {
    const learnerGroup = this.server.create('learnerGroup', { id: 1 });
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
    const userModel1 = await this.owner.lookup('service:store').find('user', user1.id);
    const userModel2 = await this.owner.lookup('service:store').find('user', user2.id);
    const userModel3 = await this.owner.lookup('service:store').find('user', user3.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .find('learner-group', learnerGroup.id);
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
    await render(hbs`<LearnerGroup::UserManager
      @learnerGroupId={{this.learnerGroup.Id}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top group"
      @cohortTitle="this cohort"
      @users={{this.users}}
      @sortBy="fullName"
      @setSortBy={{(noop)}}
      @isEditing={{true}}
      @addUserToGroup={{(noop)}}
      @removeUserFromGroup={{(noop)}}
      @addUsersToGroup={{(noop)}}
      @removeUsersFromGroup={{(noop)}}
    />`);

    assert.strictEqual(component.usersNotInCurrentGroup.length, 3);
    assert.strictEqual(component.usersNotInCurrentGroup[0].name.userNameInfo.fullName, 'Captain J');
    assert.strictEqual(
      component.usersNotInCurrentGroup[1].name.userNameInfo.fullName,
      'Jackson M. Mc1son'
    );
    assert.strictEqual(
      component.usersNotInCurrentGroup[2].name.userNameInfo.fullName,
      'Jasper M. Mc0son'
    );
  });

  test('add multiple users', async function (assert) {
    assert.expect(5);
    const learnerGroup = this.server.create('learnerGroup', { id: 1 });
    const user = this.server.create('user', { enabled: true, learnerGroups: [learnerGroup] });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .find('learner-group', learnerGroup.id);
    const userModelProxy = ObjectProxy.create({
      content: userModel,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title,
    });

    this.set('users', [userModelProxy]);
    this.set('learnerGroup', learnerGroupModel);
    this.set('addMany', ([user]) => {
      assert.strictEqual(userModel, user);
    });
    await render(hbs`<LearnerGroup::UserManager
      @learnerGroupId={{this.learnerGroup.id}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top group"
      @cohortTitle="this cohort"
      @users={{this.users}}
      @sortBy="id"
      @setSortBy={{(noop)}}
      @isEditing={{true}}
      @addUserToGroup={{(noop)}}
      @removeUserFromGroup={{(noop)}}
      @addUsersToGroup={{this.addMany}}
      @removeUsersFromGroup={{(noop)}}
    />`);

    assert.notOk(component.membersCanBeAdded);
    await component.usersInCurrentGroup[0].select();
    assert.ok(component.membersCanBeAdded);
    assert.strictEqual(component.addButtonText, 'Move learner to this group');
    await component.add();
    assert.notOk(component.membersCanBeAdded);
  });

  test('remove multiple users', async function (assert) {
    assert.expect(5);
    const learnerGroup = this.server.create('learnerGroup', { id: 1 });
    const user = this.server.create('user', { enabled: true, learnerGroups: [learnerGroup] });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .find('learner-group', learnerGroup.id);
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
    await render(hbs`<LearnerGroup::UserManager
      @learnerGroupId={{this.learnerGroup.id}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top group"
      @cohortTitle="this cohort"
      @users={{this.users}}
      @sortBy="id"
      @setSortBy={{(noop)}}
      @isEditing={{true}}
      @addUserToGroup={{(noop)}}
      @removeUserFromGroup={{(noop)}}
      @addUsersToGroup={{(noop)}}
      @removeUsersFromGroup={{this.removeMany}}
    />`);

    assert.notOk(component.membersCanBeRemoved);
    await component.usersInCurrentGroup[0].select();
    assert.ok(component.membersCanBeRemoved);
    assert.strictEqual(component.removeButtonText, 'Remove learner to this cohort');
    await component.remove();
    assert.notOk(component.membersCanBeRemoved);
  });

  test('remove single user', async function (assert) {
    assert.expect(1);

    const learnerGroup = this.server.create('learnerGroup', { id: 1 });
    const user = this.server.create('user', { enabled: true, learnerGroups: [learnerGroup] });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .find('learner-group', learnerGroup.id);
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

    await render(hbs`<LearnerGroup::UserManager
      @learnerGroupId={{this.learnerGroup.id}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top group"
      @cohortTitle="this cohort"
      @users={{this.users}}
      @sortBy="id"
      @setSortBy={{(noop)}}
      @isEditing={{true}}
      @addUserToGroup={{(noop)}}
      @removeUserFromGroup={{this.removeOne}}
      @addUsersToGroup={{(noop)}}
      @removeUsersFromGroup={{(noop)}}
    />`);

    await component.usersInCurrentGroup[0].remove();
  });

  test('add single user', async function (assert) {
    assert.expect(1);

    const learnerGroup = this.server.create('learnerGroup', { id: 1 });
    const learnerGroup2 = this.server.create('learnerGroup', { id: 2 });
    const user = this.server.create('user', { enabled: true, learnerGroups: [learnerGroup2] });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .find('learner-group', learnerGroup.id);
    const learnerGroupModel2 = await this.owner
      .lookup('service:store')
      .find('learner-group', learnerGroup2.id);
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

    await render(hbs`<LearnerGroup::UserManager
      @learnerGroupId={{this.learnerGroupModel.id}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top group"
      @cohortTitle="this cohort"
      @users={{this.users}}
      @sortBy="id"
      @setSortBy={{(noop)}}
      @isEditing={{true}}
      @addUserToGroup={{this.addOne}}
      @removeUserFromGroup={{(noop)}}
      @addUsersToGroup={{(noop)}}
      @removeUsersFromGroup={{(noop)}}
    />`);
    await component.usersNotInCurrentGroup[0].add();
  });

  test('when users are selected single action is disabled', async function (assert) {
    const learnerGroup = this.server.create('learnerGroup', { id: 1 });
    const learnerGroup2 = this.server.create('learnerGroup', { id: 2 });
    const user = this.server.create('user', { enabled: true, learnerGroups: [learnerGroup] });
    const user2 = this.server.create('user', { enabled: true, learnerGroups: [learnerGroup2] });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    const userModel2 = await this.owner.lookup('service:store').find('user', user2.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .find('learner-group', learnerGroup.id);
    const learnerGroupModel2 = await this.owner
      .lookup('service:store')
      .find('learner-group', learnerGroup2.id);
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
    await render(hbs`<LearnerGroup::UserManager
      @learnerGroupId={{this.learnerGroup.id}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top group"
      @cohortTitle="this cohort"
      @users={{this.users}}
      @sortBy="id"
      @setSortBy={{(noop)}}
      @isEditing={{true}}
      @addUserToGroup={{(noop)}}
      @removeUserFromGroup={{(noop)}}
      @addUsersToGroup={{(noop)}}
      @removeUsersFromGroup={{(noop)}}
    />`);

    assert.ok(component.usersInCurrentGroup[0].canBeRemoved);
    assert.ok(component.usersNotInCurrentGroup[0].canBeAdded);
    await component.usersInCurrentGroup[0].select();
    assert.notOk(component.usersInCurrentGroup[0].canBeRemoved);
    assert.notOk(component.usersNotInCurrentGroup[0].canBeAdded);
  });

  test('check all', async function (assert) {
    assert.expect(7);
    const learnerGroup = this.server.create('learnerGroup', { id: 1 });
    const user = this.server.create('user', { enabled: true, learnerGroups: [learnerGroup] });
    const user2 = this.server.create('user', { enabled: true, learnerGroups: [learnerGroup] });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    const userModel2 = await this.owner.lookup('service:store').find('user', user2.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .find('learner-group', learnerGroup.id);
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
    this.set('addMany', ([userA, userB]) => {
      assert.strictEqual(userModel, userA);
      assert.strictEqual(userModel2, userB);
    });
    this.set('learnerGroup', learnerGroupModel);

    await render(hbs`<LearnerGroup::UserManager
      @learnerGroupId={{this.learnerGroup.id}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top group"
      @cohortTitle="this cohort"
      @users={{this.users}}
      @sortBy="id"
      @setSortBy={{(noop)}}
      @isEditing={{true}}
      @addUserToGroup={{(noop)}}
      @removeUserFromGroup={{(noop)}}
      @addUsersToGroup={{this.addMany}}
      @removeUsersFromGroup={{(noop)}}
    />`);
    assert.notOk(component.usersInCurrentGroup[0].isSelected);
    assert.notOk(component.usersInCurrentGroup[0].isSelected);
    await component.selectAll.toggle();
    assert.ok(component.usersInCurrentGroup[0].isSelected);
    assert.ok(component.usersInCurrentGroup[0].isSelected);
    assert.strictEqual(component.addButtonText, 'Move 2 learners to this group');
    await component.add();
  });

  test('checking one puts checkall box into indeterminate state', async function (assert) {
    const learnerGroup = this.server.create('learnerGroup', { id: 1 });
    const user = this.server.create('user', { enabled: true, learnerGroups: [learnerGroup] });
    const user2 = this.server.create('user', { enabled: true, learnerGroups: [learnerGroup] });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    const userModel2 = await this.owner.lookup('service:store').find('user', user2.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .find('learner-group', learnerGroup.id);
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

    await render(hbs`<LearnerGroup::UserManager
      @learnerGroupId={{this.learnerGroup.id}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top group"
      @cohortTitle="this cohort"
      @users={{this.users}}
      @sortBy="id"
      @setSortBy={{(noop)}}
      @isEditing={{true}}
      @addUserToGroup={{(noop)}}
      @removeUserFromGroup={{(noop)}}
      @addUsersToGroup={{(noop)}}
      @removeUsersFromGroup={{(noop)}}
    />`);

    assert.notOk(component.usersInCurrentGroup[0].isSelected);
    assert.notOk(component.usersInCurrentGroup[1].isSelected);
    assert.notOk(component.selectAll.isChecked);
    assert.notOk(component.selectAll.isIndeterminate);
    await component.usersInCurrentGroup[0].select();
    assert.notOk(component.selectAll.isChecked);
    assert.ok(component.selectAll.isIndeterminate);
    await component.usersInCurrentGroup[1].select();
    assert.ok(component.selectAll.isChecked);
    assert.notOk(component.selectAll.isIndeterminate);
    assert.ok(component.usersInCurrentGroup[0].isSelected);
    assert.ok(component.usersInCurrentGroup[1].isSelected);
    await component.selectAll.toggle();
    assert.notOk(component.usersInCurrentGroup[0].isSelected);
    assert.notOk(component.usersInCurrentGroup[1].isSelected);
  });

  test('filtering and bulk-selection', async function (assert) {
    const learnerGroup = this.server.create('learnerGroup', { id: 1 });
    const user1 = this.server.create('user', { enabled: true, displayName: 'Alpha' });
    const user2 = this.server.create('user', { enabled: true, displayName: 'Beta' });
    const user3 = this.server.create('user', { enabled: true, displayName: 'Gamma' });
    const userModel1 = await this.owner.lookup('service:store').find('user', user1.id);
    const userModel2 = await this.owner.lookup('service:store').find('user', user2.id);
    const userModel3 = await this.owner.lookup('service:store').find('user', user3.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .find('learner-group', learnerGroup.id);

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

    await render(hbs`<LearnerGroup::UserManager
      @learnerGroupId={{this.learnerGroup.id}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top group"
      @cohortTitle="this cohort"
      @users={{this.users}}
      @sortBy="id"
      @setSortBy={{(noop)}}
      @isEditing={{true}}
      @addUserToGroup={{(noop)}}
      @removeUserFromGroup={{(noop)}}
      @addUsersToGroup={{(noop)}}
      @removeUsersFromGroup={{(noop)}}
    />`);

    assert.strictEqual(component.usersInCurrentGroup.length, 3);
    assert.strictEqual(component.usersInCurrentGroup[0].name.userNameInfo.fullName, 'Alpha');
    assert.strictEqual(component.usersInCurrentGroup[1].name.userNameInfo.fullName, 'Beta');
    assert.strictEqual(component.usersInCurrentGroup[2].name.userNameInfo.fullName, 'Gamma');
    assert.notOk(component.usersInCurrentGroup[0].isSelected);
    assert.notOk(component.usersInCurrentGroup[1].isSelected);
    assert.notOk(component.usersInCurrentGroup[2].isSelected);
    assert.notOk(component.selectAll.isChecked);
    assert.notOk(component.selectAll.isIndeterminate);

    await component.filter('Zzzz');
    assert.strictEqual(component.usersInCurrentGroup.length, 0);
    assert.notOk(component.selectAll.isChecked);
    assert.notOk(component.selectAll.isIndeterminate);

    await component.filter('');
    assert.strictEqual(component.usersInCurrentGroup.length, 3);
    assert.notOk(component.selectAll.isChecked);
    assert.notOk(component.selectAll.isIndeterminate);

    await component.usersInCurrentGroup[2].select();
    assert.notOk(component.selectAll.isChecked);
    assert.ok(component.selectAll.isIndeterminate);

    await component.filter('Alpha');
    assert.notOk(component.selectAll.isChecked);
    assert.ok(component.selectAll.isIndeterminate);
    assert.strictEqual(component.usersInCurrentGroup.length, 1);
    assert.strictEqual(component.usersInCurrentGroup[0].name.userNameInfo.fullName, 'Alpha');
    assert.notOk(component.usersInCurrentGroup[0].isSelected);

    await component.selectAll.toggle();
    assert.ok(component.selectAll.isChecked);
    assert.ok(component.selectAll.isIndeterminate);
    assert.ok(component.usersInCurrentGroup[0].isSelected);

    await component.filter('');
    assert.strictEqual(component.usersInCurrentGroup.length, 3);
    assert.ok(component.selectAll.isChecked);
    assert.ok(component.selectAll.isIndeterminate);
    assert.ok(component.usersInCurrentGroup[0].isSelected);
    assert.notOk(component.usersInCurrentGroup[1].isSelected);
    assert.ok(component.usersInCurrentGroup[2].isSelected);

    await component.selectAll.toggle();
    assert.ok(component.selectAll.isChecked);
    assert.notOk(component.selectAll.isIndeterminate);
    assert.ok(component.usersInCurrentGroup[0].isSelected);
    assert.ok(component.usersInCurrentGroup[1].isSelected);
    assert.ok(component.usersInCurrentGroup[2].isSelected);

    await component.selectAll.toggle();
    assert.notOk(component.selectAll.isChecked);
    assert.notOk(component.selectAll.isIndeterminate);
    assert.notOk(component.usersInCurrentGroup[0].isSelected);
    assert.notOk(component.usersInCurrentGroup[1].isSelected);
    assert.notOk(component.usersInCurrentGroup[2].isSelected);
  });

  test('root users can manage disabled users', async function (assert) {
    assert.expect(2);

    const currentUserMock = Service.extend({ isRoot: true });
    this.owner.register('service:currentUser', currentUserMock);

    const learnerGroup = this.server.create('learnerGroup', { id: 1 });
    const user = this.server.create('user', { enabled: false, learnerGroups: [learnerGroup] });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .find('learner-group', learnerGroup.id);
    const userModelProxy = ObjectProxy.create({
      content: userModel,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title,
    });

    this.set('users', [userModelProxy]);
    this.set('learnerGroup', learnerGroupModel);
    await render(hbs`<LearnerGroup::UserManager
      @learnerGroupId={{this.learnerGroup.id}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top group"
      @cohortTitle="this cohort"
      @users={{this.users}}
      @sortBy="id"
      @setSortBy={{(noop)}}
      @isEditing={{true}}
      @addUserToGroup={{(noop)}}
      @removeUserFromGroup={{(noop)}}
      @addUsersToGroup={{(noop)}}
      @removeUsersFromGroup={{(noop)}}
    />`);

    assert.ok(component.usersInCurrentGroup[0].canBeSelected, 'Checkbox visible');
    assert.ok(component.usersInCurrentGroup[0].isDisabled, 'User is labeled as disabled.');
  });

  test('non-root users cannot manage disabled users', async function (assert) {
    assert.expect(2);

    const currentUserMock = Service.extend({ isRoot: false });
    this.owner.register('service:currentUser', currentUserMock);

    const learnerGroup = this.server.create('learnerGroup', { id: 1 });
    const user = this.server.create('user', { enabled: false, learnerGroups: [learnerGroup] });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .find('learner-group', learnerGroup.id);
    const userModelProxy = ObjectProxy.create({
      content: userModel,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title,
    });

    this.set('users', [userModelProxy]);
    this.set('learnerGroup', learnerGroupModel);
    await render(hbs`<LearnerGroup::UserManager
      @learnerGroupId={{this.learnerGroup.id}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top group"
      @cohortTitle="this cohort"
      @users={{this.users}}
      @sortBy="id"
      @setSortBy={{(noop)}}
      @isEditing={{true}}
      @addUserToGroup={{(noop)}}
      @removeUserFromGroup={{(noop)}}
      @addUsersToGroup={{(noop)}}
      @removeUsersFromGroup={{(noop)}}
    />`);

    assert.notOk(component.usersInCurrentGroup[0].canBeSelected, 'Checkbox visible');
    assert.ok(component.usersInCurrentGroup[0].isDisabled, 'User is labeled as disabled.');
  });

  test('filter users', async function (assert) {
    const learnerGroup = this.server.create('learnerGroup', { id: 1 });
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
    const userModel1 = await this.owner.lookup('service:store').find('user', user1.id);
    const userModel2 = await this.owner.lookup('service:store').find('user', user2.id);
    const userModel3 = await this.owner.lookup('service:store').find('user', user3.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .find('learner-group', learnerGroup.id);
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
    await render(hbs`<LearnerGroup::UserManager
      @learnerGroupId={{this.learnerGroup.id}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top group"
      @cohortTitle="this cohort"
      @users={{this.users}}
      @sortBy="id"
      @setSortBy={{(noop)}}
      @isEditing={{false}}
      @addUserToGroup={{(noop)}}
      @removeUserFromGroup={{(noop)}}
      @addUsersToGroup={{(noop)}}
      @removeUsersFromGroup={{(noop)}}
    />`);

    assert.strictEqual(component.usersInCurrentGroup.length, 3);
    assert.strictEqual(
      component.usersInCurrentGroup[0].name.userNameInfo.fullName,
      'Jasper M. Dog'
    );
    assert.strictEqual(
      component.usersInCurrentGroup[1].name.userNameInfo.fullName,
      'Jackson M. Doggy'
    );
    assert.strictEqual(component.usersInCurrentGroup[2].name.userNameInfo.fullName, 'Just Jayden');
    await component.filter('Just');
    assert.strictEqual(component.usersInCurrentGroup[0].name.userNameInfo.fullName, 'Just Jayden');
    await component.filter(' Just     ');
    assert.strictEqual(component.usersInCurrentGroup[0].name.userNameInfo.fullName, 'Just Jayden');
    await component.filter('JASPER.DOG@EXAMPLE.EDU');
    assert.strictEqual(
      component.usersInCurrentGroup[0].name.userNameInfo.fullName,
      'Jasper M. Dog'
    );
    await component.filter('jasper d');
    assert.strictEqual(
      component.usersInCurrentGroup[0].name.userNameInfo.fullName,
      'Jasper M. Dog'
    );
  });

  test('user not in group: click on name', async function (assert) {
    const learnerGroup = this.server.create('learnerGroup', { id: 1 });
    const learnerGroup2 = this.server.create('learnerGroup', { id: 2 });
    const user = this.server.create('user', { enabled: true, learnerGroups: [learnerGroup2] });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .find('learner-group', learnerGroup.id);
    const learnerGroupModel2 = await this.owner
      .lookup('service:store')
      .find('learner-group', learnerGroup2.id);
    const userModelProxy = ObjectProxy.create({
      content: userModel,
      lowestGroupInTree: learnerGroupModel2,
      lowestGroupInTreeTitle: learnerGroupModel2.title,
    });
    this.set('users', [userModelProxy]);
    this.set('learnerGroup', learnerGroupModel);

    await render(hbs`<LearnerGroup::UserManager
      @learnerGroupId={{this.learnerGroupModel.id}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top group"
      @cohortTitle="this cohort"
      @users={{this.users}}
      @sortBy="id"
      @setSortBy={{(noop)}}
      @isEditing={{true}}
      @addUserToGroup={{(noop)}}
      @removeUserFromGroup={{(noop)}}
      @addUsersToGroup={{(noop)}}
      @removeUsersFromGroup={{(noop)}}
    />`);

    assert.notOk(component.usersNotInCurrentGroup[0].isSelected);
    await component.usersNotInCurrentGroup[0].name.click();
    assert.ok(component.usersNotInCurrentGroup[0].isSelected);
  });

  test('user not in group: click on campus id', async function (assert) {
    const learnerGroup = this.server.create('learnerGroup', { id: 1 });
    const learnerGroup2 = this.server.create('learnerGroup', { id: 2 });
    const user = this.server.create('user', { enabled: true, learnerGroups: [learnerGroup2] });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .find('learner-group', learnerGroup.id);
    const learnerGroupModel2 = await this.owner
      .lookup('service:store')
      .find('learner-group', learnerGroup2.id);
    const userModelProxy = ObjectProxy.create({
      content: userModel,
      lowestGroupInTree: learnerGroupModel2,
      lowestGroupInTreeTitle: learnerGroupModel2.title,
    });
    this.set('users', [userModelProxy]);
    this.set('learnerGroup', learnerGroupModel);

    await render(hbs`<LearnerGroup::UserManager
      @learnerGroupId={{this.learnerGroupModel.id}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top group"
      @cohortTitle="this cohort"
      @users={{this.users}}
      @sortBy="id"
      @setSortBy={{(noop)}}
      @isEditing={{true}}
      @addUserToGroup={{(noop)}}
      @removeUserFromGroup={{(noop)}}
      @addUsersToGroup={{(noop)}}
      @removeUsersFromGroup={{(noop)}}
    />`);

    assert.notOk(component.usersNotInCurrentGroup[0].isSelected);
    await component.usersNotInCurrentGroup[0].campusId.click();
    assert.ok(component.usersNotInCurrentGroup[0].isSelected);
  });

  test('user not in group: click on email', async function (assert) {
    const learnerGroup = this.server.create('learnerGroup', { id: 1 });
    const learnerGroup2 = this.server.create('learnerGroup', { id: 2 });
    const user = this.server.create('user', { enabled: true, learnerGroups: [learnerGroup2] });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .find('learner-group', learnerGroup.id);
    const learnerGroupModel2 = await this.owner
      .lookup('service:store')
      .find('learner-group', learnerGroup2.id);
    const userModelProxy = ObjectProxy.create({
      content: userModel,
      lowestGroupInTree: learnerGroupModel2,
      lowestGroupInTreeTitle: learnerGroupModel2.title,
    });
    this.set('users', [userModelProxy]);
    this.set('learnerGroup', learnerGroupModel);

    await render(hbs`<LearnerGroup::UserManager
      @learnerGroupId={{this.learnerGroupModel.id}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top group"
      @cohortTitle="this cohort"
      @users={{this.users}}
      @sortBy="id"
      @setSortBy={{(noop)}}
      @isEditing={{true}}
      @addUserToGroup={{(noop)}}
      @removeUserFromGroup={{(noop)}}
      @addUsersToGroup={{(noop)}}
      @removeUsersFromGroup={{(noop)}}
    />`);

    assert.notOk(component.usersNotInCurrentGroup[0].isSelected);
    await component.usersNotInCurrentGroup[0].email.click();
    assert.ok(component.usersNotInCurrentGroup[0].isSelected);
  });

  test('user in group: click on name', async function (assert) {
    const learnerGroup = this.server.create('learnerGroup', { id: 1 });
    const user = this.server.create('user', { enabled: true, learnerGroups: [learnerGroup] });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .find('learner-group', learnerGroup.id);
    const userModelProxy = ObjectProxy.create({
      content: userModel,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title,
    });
    this.set('users', [userModelProxy]);
    this.set('learnerGroup', learnerGroupModel);

    await render(hbs`<LearnerGroup::UserManager
      @learnerGroupId={{this.learnerGroup.id}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top group"
      @cohortTitle="this cohort"
      @users={{this.users}}
      @sortBy="id"
      @setSortBy={{(noop)}}
      @isEditing={{true}}
      @addUserToGroup={{(noop)}}
      @removeUserFromGroup={{(noop)}}
      @addUsersToGroup={{(noop)}}
      @removeUsersFromGroup={{(noop)}}
    />`);

    assert.notOk(component.usersInCurrentGroup[0].isSelected);
    await component.usersInCurrentGroup[0].name.click();
    assert.ok(component.usersInCurrentGroup[0].isSelected);
  });

  test('user in group: click on campus id', async function (assert) {
    const learnerGroup = this.server.create('learnerGroup', { id: 1 });
    const user = this.server.create('user', { enabled: true, learnerGroups: [learnerGroup] });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .find('learner-group', learnerGroup.id);
    const userModelProxy = ObjectProxy.create({
      content: userModel,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title,
    });
    this.set('users', [userModelProxy]);
    this.set('learnerGroup', learnerGroupModel);

    await render(hbs`<LearnerGroup::UserManager
      @learnerGroupId={{this.learnerGroup.id}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top group"
      @cohortTitle="this cohort"
      @users={{this.users}}
      @sortBy="id"
      @setSortBy={{(noop)}}
      @isEditing={{true}}
      @addUserToGroup={{(noop)}}
      @removeUserFromGroup={{(noop)}}
      @addUsersToGroup={{(noop)}}
      @removeUsersFromGroup={{(noop)}}
    />`);

    assert.notOk(component.usersInCurrentGroup[0].isSelected);
    await component.usersInCurrentGroup[0].campusId.click();
    assert.ok(component.usersInCurrentGroup[0].isSelected);
  });

  test('user in group: click on email', async function (assert) {
    const learnerGroup = this.server.create('learnerGroup', { id: 1 });
    const user = this.server.create('user', { enabled: true, learnerGroups: [learnerGroup] });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .find('learner-group', learnerGroup.id);
    const userModelProxy = ObjectProxy.create({
      content: userModel,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title,
    });
    this.set('users', [userModelProxy]);
    this.set('learnerGroup', learnerGroupModel);

    await render(hbs`<LearnerGroup::UserManager
      @learnerGroupId={{this.learnerGroup.id}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top group"
      @cohortTitle="this cohort"
      @users={{this.users}}
      @sortBy="id"
      @setSortBy={{(noop)}}
      @isEditing={{true}}
      @addUserToGroup={{(noop)}}
      @removeUserFromGroup={{(noop)}}
      @addUsersToGroup={{(noop)}}
      @removeUsersFromGroup={{(noop)}}
    />`);

    assert.notOk(component.usersInCurrentGroup[0].isSelected);
    await component.usersInCurrentGroup[0].email.click();
    assert.ok(component.usersInCurrentGroup[0].isSelected);
  });
});
