import Service from '@ember/service';
import ObjectProxy from '@ember/object/proxy';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click, findAll, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | learnergroup user manager', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    const userList = 'tbody tr';
    const user1FullName = 'tbody tr:nth-of-type(1) td:nth-of-type(2)';
    const user1CampusId = 'tbody tr:nth-of-type(1) td:nth-of-type(3)';
    const user1Email = 'tbody tr:nth-of-type(1) td:nth-of-type(4)';
    const user2Disabled = 'tbody tr:nth-of-type(2) td:nth-of-type(1) svg';
    const user2FullName = 'tbody tr:nth-of-type(2) td:nth-of-type(2)';
    const user2CampusId = 'tbody tr:nth-of-type(2) td:nth-of-type(3)';
    const user2Email = 'tbody tr:nth-of-type(2) td:nth-of-type(4)';

    const learnerGroup = this.server.create('learnerGroup', { id: 1 });
    const user1 = this.server.create('user', {
      firstName: 'Jasper',
      lastName: 'Dog',
      campusId: '1234',
      email: 'testemail',
      enabled: true,
      learnerGroups: [ learnerGroup ],

    });
    const user2 = this.server.create('user', {
      firstName: 'Jackson',
      lastName: 'Doggy',
      campusId: '123',
      email: 'testemail2',
      enabled: false,
      learnerGroups: [ learnerGroup ],
    });
    const userModel1 = await this.owner.lookup('service:store').find('user', user1.id);
    const userModel2 = await this.owner.lookup('service:store').find('user', user2.id);
    const learnerGroupModel = await this.owner.lookup('service:store').find('learner-group', learnerGroup.id);
    // @todo gross! see if proxy can be eliminated in upstream component <LearnergroupSummary> [ ST 2020/08/07 ]
    const userModelProxy1 = ObjectProxy.create({
      content: userModel1,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title
    });
    const userModelProxy2 = ObjectProxy.create({
      content: userModel2,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title
    });
    this.set('users', [ userModelProxy1, userModelProxy2 ]);
    this.set('learnerGroup', learnerGroupModel );
    await render(hbs`<LearnergroupUserManager
      @learnerGroupId={{this.learnerGroup.id}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top group"
      @cohortTitle="this cohort"
      @users={{this.users}}
      @sortBy="id"
      @setSortBy={{noop}}
      @isEditing={{false}}
      @addUserToGroup={{noop}}
      @removeUserFromGroup={{noop}}
      @addUsersToGroup={{noop}}
      @removeUsersFromGroup={{noop}}
    />`);

    assert.dom('.title').hasText('Members (2)');
    assert.dom(userList).exists({ count: 2 });
    assert.dom(user1FullName).hasText('Jasper M. Dog');
    assert.dom(user1CampusId).hasText('1234');
    assert.dom(user1Email).hasText('testemail');
    assert.dom(user2Disabled).exists({ count: 1 });
    assert.dom(user2FullName).hasText('Jackson M. Doggy');
    assert.dom(user2CampusId).hasText('123');
    assert.dom(user2Email).hasText('testemail2');
  });

  test('it renders when editing', async function(assert) {
    const userList = 'tbody tr';
    const user1CheckBox = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input[type=checkbox]';
    const user1FullName = 'tbody tr:nth-of-type(1) td:nth-of-type(2)';
    const user1CampusId = 'tbody tr:nth-of-type(1) td:nth-of-type(3)';
    const user1Email = 'tbody tr:nth-of-type(1) td:nth-of-type(4)';
    const user2Disabled = 'tbody tr:nth-of-type(2) td:nth-of-type(1) svg';
    const user2FullName = 'tbody tr:nth-of-type(2) td:nth-of-type(2)';
    const user2CampusId = 'tbody tr:nth-of-type(2) td:nth-of-type(3)';
    const user2Email = 'tbody tr:nth-of-type(2) td:nth-of-type(4)';

    const learnerGroup = this.server.create('learnerGroup', { id: 1 });
    const user1 = this.server.create('user', {
      firstName: 'Jasper',
      lastName: 'Dog',
      campusId: '1234',
      email: 'testemail',
      enabled: true,
      learnerGroups: [ learnerGroup ],
    });
    const user2 = this.server.create('user', {
      firstName: 'Jackson',
      lastName: 'Doggy',
      campusId: '123',
      email: 'testemail2',
      enabled: false,
      learnerGroups: [ learnerGroup ],
    });
    const userModel1 = await this.owner.lookup('service:store').find('user', user1.id);
    const userModel2 = await this.owner.lookup('service:store').find('user', user2.id);
    const learnerGroupModel = await this.owner.lookup('service:store').find('learner-group', learnerGroup.id);
    const userModelProxy1 = ObjectProxy.create({
      content: userModel1,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title
    });
    const userModelProxy2 = ObjectProxy.create({
      content: userModel2,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title
    });

    this.set('users', [ userModelProxy1, userModelProxy2 ]);
    this.set('learnerGroup', learnerGroupModel);
    await render(hbs`<LearnergroupUserManager
      @learnerGroupId={{this.learnerGroup.id}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top group"
      @cohortTitle="this cohort"
      @users={{this.users}}
      @sortBy="id"
      @setSortBy={{noop}}
      @isEditing={{true}}
      @addUserToGroup={{noop}}
      @removeUserFromGroup={{noop}}
      @addUsersToGroup={{noop}}
      @removeUsersFromGroup={{noop}}
    />`);

    assert.dom('[data-test-group-members]').hasText('Members of current group (2)');
    assert.dom('[data-test-all-other-members]').hasText('All other members of top group (0)');
    assert.dom(userList).exists({ count: 2 });
    assert.dom(user1CheckBox).exists({ count: 1 });
    assert.dom(user1CheckBox).isNotChecked();
    assert.dom(user1FullName).hasText('Jasper M. Dog');
    assert.dom(user1CampusId).hasText('1234');
    assert.dom(user1Email).hasText('testemail');

    assert.dom(user2Disabled).exists({ count: 1 });
    assert.dom(user2FullName).hasText('Jackson M. Doggy');
    assert.dom(user2CampusId).hasText('123');
    assert.dom(user2Email).hasText('testemail2');
  });

  test('sort by full name', async function(assert) {
    const userList = 'tbody tr';
    const user1FullName = 'tbody tr:nth-of-type(1) td:nth-of-type(2)';
    const user2FullName = 'tbody tr:nth-of-type(2) td:nth-of-type(2)';
    const user3FullName = 'tbody tr:nth-of-type(3) td:nth-of-type(2)';

    const learnerGroup = this.server.create('learnerGroup', { id: 1 });
    const user1 = this.server.create('user', {
      firstName: 'Jasper',
      learnerGroups: [ learnerGroup ],
    });
    const user2 = this.server.create('user', {
      firstName: 'Jackson',
      learnerGroups: [ learnerGroup ],
    });
    const user3 = this.server.create('user', {
      firstName: 'Jayden',
      displayName: 'Captain J',
      learnerGroups: [ learnerGroup ],
    });
    const userModel1 = await this.owner.lookup('service:store').find('user', user1.id);
    const userModel2 = await this.owner.lookup('service:store').find('user', user2.id);
    const userModel3 = await this.owner.lookup('service:store').find('user', user3.id);
    const learnerGroupModel = await this.owner.lookup('service:store').find('learner-group', learnerGroup.id);
    const userModelProxy1 = ObjectProxy.create({
      content: userModel1,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title
    });
    const userModelProxy2 = ObjectProxy.create({
      content: userModel2,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title
    });
    const userModelProxy3 = ObjectProxy.create({
      content: userModel3,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title
    });

    this.set('users', [ userModelProxy1, userModelProxy2, userModelProxy3 ]);
    this.set('learnerGroup', learnerGroupModel );
    await render(hbs`<LearnergroupUserManager
      @learnerGroupId={{this.learnerGroup.Id}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top group"
      @cohortTitle="this cohort"
      @users={{this.users}}
      @sortBy="fullName"
      @setSortBy={{noop}}
      @isEditing={{true}}
      @addUserToGroup={{noop}}
      @removeUserFromGroup={{noop}}
      @addUsersToGroup={{noop}}
      @removeUsersFromGroup={{noop}}
    />`);

    assert.dom(userList).exists({ count: 3 });
    assert.dom(user1FullName).hasText('Captain J');
    assert.dom(user2FullName).hasText('Jackson M. Mc1son');
    assert.dom(user3FullName).hasText('Jasper M. Mc0son');
  });

  test('add multiple users', async function(assert) {
    assert.expect(5);
    const user1CheckBox = 'table:nth-of-type(2) tbody tr:nth-of-type(1) td:nth-of-type(1) input[type=checkbox]';
    const button = 'button.done';

    const learnerGroup = this.server.create('learnerGroup', { id: 1 });
    const user = this.server.create('user', { enabled: true, learnerGroups: [ learnerGroup ] });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    const learnerGroupModel = await this.owner.lookup('service:store').find('learner-group', learnerGroup.id);
    const userModelProxy = ObjectProxy.create({
      content: userModel,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title
    });

    this.set('users', [ userModelProxy ]);
    this.set('learnerGroup', learnerGroupModel);
    this.set('addMany', ([ user ]) => {
      assert.equal(userModel, user);
    });
    await render(hbs`<LearnergroupUserManager
      @learnerGroupId={{this.learnerGroup.id}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top group"
      @cohortTitle="this cohort"
      @users={{this.users}}
      @sortBy="id"
      @setSortBy={{noop}}
      @isEditing={{true}}
      @addUserToGroup={{noop}}
      @removeUserFromGroup={{noop}}
      @addUsersToGroup={{this.addMany}}
      @removeUsersFromGroup={{noop}}
    />`);

    assert.dom(button).doesNotExist();
    await click(user1CheckBox);
    assert.dom(user1CheckBox).isChecked();
    assert.dom(button).hasText('Move learner to this group');
    await click(button);
    await settled();
    assert.dom(button).doesNotExist();

  });

  test('remove multiple users', async function(assert) {
    assert.expect(5);
    const user1CheckBox = 'table:nth-of-type(2) tbody tr:nth-of-type(1) td:nth-of-type(1) input[type=checkbox]';
    const button = 'button.cancel';

    const learnerGroup = this.server.create('learnerGroup', { id: 1 });
    const user = this.server.create('user', { enabled: true, learnerGroups: [ learnerGroup ] });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    const learnerGroupModel = await this.owner.lookup('service:store').find('learner-group', learnerGroup.id);
    const userModelProxy = ObjectProxy.create({
      content: userModel,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title
    });

    this.set('users', [ userModelProxy ]);
    this.set('learnerGroup', learnerGroupModel);
    this.set('removeMany', ([ user ]) => {
      assert.equal(userModel, user);
    });
    await render(hbs`<LearnergroupUserManager
      @learnerGroupId={{this.learnerGroup.id}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top group"
      @cohortTitle="this cohort"
      @users={{this.users}}
      @sortBy="id"
      @setSortBy={{noop}}
      @isEditing={{true}}
      @addUserToGroup={{noop}}
      @removeUserFromGroup={{noop}}
      @addUsersToGroup={{noop}}
      @removeUsersFromGroup={{this.removeMany}}
    />`);

    assert.dom(button).doesNotExist();
    await click(user1CheckBox);
    assert.dom(user1CheckBox).isChecked();
    assert.dom(button).hasText('Remove learner to this cohort');
    await click(button);
    await settled();
    assert.dom(button).doesNotExist();
  });

  test('remove single user', async function(assert) {
    assert.expect(1);
    const action = 'table:nth-of-type(2) tbody tr:nth-of-type(1) td:nth-of-type(6) .clickable';

    const learnerGroup = this.server.create('learnerGroup', { id: 1 });
    const user = this.server.create('user', { enabled: true, learnerGroups: [ learnerGroup ] });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    const learnerGroupModel = await this.owner.lookup('service:store').find('learner-group', learnerGroup.id);
    const userModelProxy = ObjectProxy.create({
      content: userModel,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title
    });

    this.set('users', [ userModelProxy ]);
    this.set('learnerGroup', learnerGroupModel);
    this.set('removeOne', user => {
      assert.equal(userModel, user);
    });

    await render(hbs`<LearnergroupUserManager
      @learnerGroupId={{this.learnerGroup.id}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top group"
      @cohortTitle="this cohort"
      @users={{this.users}}
      @sortBy="id"
      @setSortBy={{noop}}
      @isEditing={{true}}
      @addUserToGroup={{noop}}
      @removeUserFromGroup={{this.removeOne}}
      @addUsersToGroup={{noop}}
      @removeUsersFromGroup={{noop}}
    />`);

    await click(action);

  });

  test('add single user', async function(assert) {
    assert.expect(1);
    const action = 'table:nth-of-type(3) tbody tr:nth-of-type(1) td:nth-of-type(6) .clickable';

    const learnerGroup = this.server.create('learnerGroup', { id: 1 });
    const learnerGroup2 = this.server.create('learnerGroup', { id: 2 });
    const user = this.server.create('user', { enabled: true, learnerGroups: [ learnerGroup2 ] });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    const learnerGroupModel = await this.owner.lookup('service:store').find('learner-group', learnerGroup.id);
    const learnerGroupModel2 = await this.owner.lookup('service:store').find('learner-group', learnerGroup2.id);
    const userModelProxy = ObjectProxy.create({
      content: userModel,
      lowestGroupInTree: learnerGroupModel2,
      lowestGroupInTreeTitle: learnerGroupModel2.title
    });

    this.set('users', [ userModelProxy ]);
    this.set('learnerGroup', learnerGroupModel);
    this.set('addOne', user => {
      assert.equal(userModel, user);
    });

    await render(hbs`<LearnergroupUserManager
      @learnerGroupId={{this.learnerGroupModel.id}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top group"
      @cohortTitle="this cohort"
      @users={{this.users}}
      @sortBy="id"
      @setSortBy={{noop}}
      @isEditing={{true}}
      @addUserToGroup={{this.addOne}}
      @removeUserFromGroup={{noop}}
      @addUsersToGroup={{noop}}
      @removeUsersFromGroup={{noop}}
    />`);
    await click(action);
  });

  test('when users are selected single action is disabled', async function(assert) {
    assert.expect(2);
    const user1CheckBox = 'table:nth-of-type(2) tbody tr:nth-of-type(1) td:nth-of-type(1) input[type=checkbox]';
    const action1 = 'table:nth-of-type(2) tbody tr:nth-of-type(1) td:nth-of-type(6) .clickable';
    const action2 = 'table:nth-of-type(3) tbody tr:nth-of-type(1) td:nth-of-type(6) .clickable';

    const learnerGroup = this.server.create('learnerGroup', { id: 1 });
    const learnerGroup2 = this.server.create('learnerGroup', { id: 2 });
    const user = this.server.create('user', { enabled: true, learnerGroups: [ learnerGroup ] });
    const user2 = this.server.create('user', { enabled: true, learnerGroups: [ learnerGroup2 ] });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    const userModel2 = await this.owner.lookup('service:store').find('user', user2.id);
    const learnerGroupModel = await this.owner.lookup('service:store').find('learner-group', learnerGroup.id);
    const learnerGroupModel2 = await this.owner.lookup('service:store').find('learner-group', learnerGroup2.id);
    const userModelProxy = ObjectProxy.create({
      content: userModel,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title
    });
    const userModelProxy2 = ObjectProxy.create({
      content: userModel2,
      lowestGroupInTree: learnerGroupModel2,
      lowestGroupInTreeTitle: learnerGroupModel2.title
    });

    this.set('users', [ userModelProxy, userModelProxy2 ]);
    this.set('learnerGroup', learnerGroupModel);
    await render(hbs`<LearnergroupUserManager
      @learnerGroupId={{this.learnerGroup.id}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top group"
      @cohortTitle="this cohort"
      @users={{this.users}}
      @sortBy="id"
      @setSortBy={{noop}}
      @isEditing={{true}}
      @addUserToGroup={{noop}}
      @removeUserFromGroup={{noop}}
      @addUsersToGroup={{noop}}
      @removeUsersFromGroup={{noop}}
    />`);

    await click(user1CheckBox);
    assert.dom(action1).doesNotExist();
    assert.dom(action2).doesNotExist();

  });

  test('checkall', async function(assert) {
    assert.expect(5);
    const checkAllBox = 'thead tr:nth-of-type(1) th:nth-of-type(1) input[type=checkbox]';
    const user1CheckBox = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input[type=checkbox]';
    const user2CheckBox = 'tbody tr:nth-of-type(2) td:nth-of-type(1) input[type=checkbox]';
    const button = 'button.done';

    const learnerGroup = this.server.create('learnerGroup', { id: 1 });
    const user = this.server.create('user', { enabled: true, learnerGroups: [ learnerGroup ] });
    const user2 = this.server.create('user', { enabled: true, learnerGroups: [ learnerGroup ] });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    const userModel2 = await this.owner.lookup('service:store').find('user', user2.id);
    const learnerGroupModel = await this.owner.lookup('service:store').find('learner-group', learnerGroup.id);
    const userModelProxy = ObjectProxy.create({
      content: userModel,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title
    });
    const userModelProxy2 = ObjectProxy.create({
      content: userModel2,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title
    });

    this.set('users', [ userModelProxy, userModelProxy2 ]);
    this.set('addMany', ([userA, userB]) => {
      assert.equal(userModel, userA);
      assert.equal(userModel2, userB);
    });
    this.set('learnerGroup', learnerGroupModel);

    await render(hbs`<LearnergroupUserManager
      @learnerGroupId={{this.learnerGroup.id}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top group"
      @cohortTitle="this cohort"
      @users={{this.users}}
      @sortBy="id"
      @setSortBy={{noop}}
      @isEditing={{true}}
      @addUserToGroup={{noop}}
      @removeUserFromGroup={{noop}}
      @addUsersToGroup={{this.addMany}}
      @removeUsersFromGroup={{noop}}
    />`);

    await click(checkAllBox);
    assert.dom(user1CheckBox).isChecked();
    assert.dom(user2CheckBox).isChecked();
    assert.dom(button).hasText('Move 2 learners to this group');
    return settled(await click(button));

  });

  test('checking one puts checkall box into indeterminate state', async function(assert) {
    assert.expect(4);
    const checkAllBox = 'thead tr:nth-of-type(1) th:nth-of-type(1) input[type=checkbox]';
    const user1CheckBox = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input[type=checkbox]';
    const user2CheckBox = 'tbody tr:nth-of-type(2) td:nth-of-type(1) input[type=checkbox]';

    const learnerGroup = this.server.create('learnerGroup', { id: 1 });
    const user = this.server.create('user', { enabled: true, learnerGroups: [ learnerGroup ] });
    const user2 = this.server.create('user', { enabled: true, learnerGroups: [ learnerGroup ] });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    const userModel2 = await this.owner.lookup('service:store').find('user', user2.id);
    const learnerGroupModel = await this.owner.lookup('service:store').find('learner-group', learnerGroup.id);
    const userModelProxy = ObjectProxy.create({
      content: userModel,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title
    });
    const userModelProxy2 = ObjectProxy.create({
      content: userModel2,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title
    });

    this.set('users', [ userModelProxy, userModelProxy2 ]);
    this.set('learnerGroup', learnerGroupModel);

    await render(hbs`<LearnergroupUserManager
      @learnerGroupId={{this.learnerGroup.id}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top group"
      @cohortTitle="this cohort"
      @users={{this.users}}
      @sortBy="id"
      @setSortBy={{noop}}
      @isEditing={{true}}
      @addUserToGroup={{noop}}
      @removeUserFromGroup={{noop}}
      @addUsersToGroup={{noop}}
      @removeUsersFromGroup={{noop}}
    />`);

    await click(user1CheckBox);
    assert.ok(find(checkAllBox).indeterminate);
    await click(user2CheckBox);
    assert.dom(checkAllBox).isChecked();
    await click(checkAllBox);
    assert.dom(user1CheckBox).isNotChecked();
    assert.dom(user2CheckBox).isNotChecked();
  });

  test('root users can manage disabled users', async function(assert) {
    assert.expect(2);
    const currentUserMock = Service.extend({
      isRoot: true,
    });
    this.owner.register('service:currentUser', currentUserMock);

    const userCheckbox = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input[type=checkbox]';
    const userDisabledIcon = 'tbody tr:nth-of-type(1) td:nth-of-type(1) .fa-user-times';

    const learnerGroup = this.server.create('learnerGroup', { id: 1 });
    const user = this.server.create('user', { enabled: false, learnerGroups: [ learnerGroup ] });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    const learnerGroupModel = await this.owner.lookup('service:store').find('learner-group', learnerGroup.id);
    const userModelProxy = ObjectProxy.create({
      content: userModel,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title
    });

    this.set('users', [ userModelProxy ]);
    this.set('learnerGroup', learnerGroupModel);
    await render(hbs`<LearnergroupUserManager
      @learnerGroupId={{this.learnerGroup.id}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top group"
      @cohortTitle="this cohort"
      @users={{this.users}}
      @sortBy="id"
      @setSortBy={{noop}}
      @isEditing={{true}}
      @addUserToGroup={{noop}}
      @removeUserFromGroup={{noop}}
      @addUsersToGroup={{noop}}
      @removeUsersFromGroup={{noop}}
    />`);

    assert.equal(1, findAll(userCheckbox).length, 'Checkbox visible');
    assert.equal(1, findAll(userDisabledIcon).length, 'User is labeled as disabled.');
  });

  test('non-root users cannot manage disabled users', async function(assert) {
    assert.expect(2);
    const currentUserMock = Service.extend({
      isRoot: false,
    });
    this.owner.register('service:currentUser', currentUserMock);

    const userCheckbox = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input[type=checkbox]';
    const userDisabledIcon = 'tbody tr:nth-of-type(1) td:nth-of-type(1) .fa-user-times';

    const learnerGroup = this.server.create('learnerGroup', { id: 1 });
    const user = this.server.create('user', { enabled: false, learnerGroups: [ learnerGroup ] });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    const learnerGroupModel = await this.owner.lookup('service:store').find('learner-group', learnerGroup.id);
    const userModelProxy = ObjectProxy.create({
      content: userModel,
      lowestGroupInTree: learnerGroupModel,
      lowestGroupInTreeTitle: learnerGroupModel.title
    });

    this.set('users', [ userModelProxy ]);
    this.set('learnerGroup', learnerGroupModel);
    await render(hbs`<LearnergroupUserManager
      @learnerGroupId={{this.learnerGroup.id}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top group"
      @cohortTitle="this cohort"
      @users={{this.users}}
      @sortBy="id"
      @setSortBy={{noop}}
      @isEditing={{true}}
      @addUserToGroup={{noop}}
      @removeUserFromGroup={{noop}}
      @addUsersToGroup={{noop}}
      @removeUsersFromGroup={{noop}}
    />`);

    assert.equal(0, findAll(userCheckbox).length, 'Checkbox is not visible');
    assert.equal(1, findAll(userDisabledIcon).length, 'User is labeled as disabled.');
  });
});
