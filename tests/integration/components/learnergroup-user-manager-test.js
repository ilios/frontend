import EmberObject from '@ember/object';
import Service from '@ember/service';
import ObjectProxy from '@ember/object/proxy';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  settled,
  click,
  findAll,
  find
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | learnergroup user manager', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    const userList = 'tbody tr';
    const user1FirstName = 'tbody tr:nth-of-type(1) td:nth-of-type(2)';
    const user1LastName = 'tbody tr:nth-of-type(1) td:nth-of-type(3)';
    const user1CampusId = 'tbody tr:nth-of-type(1) td:nth-of-type(4)';
    const user1Email = 'tbody tr:nth-of-type(1) td:nth-of-type(5)';
    const user2Disabled = 'tbody tr:nth-of-type(2) td:nth-of-type(1) svg';
    const user2FirstName = 'tbody tr:nth-of-type(2) td:nth-of-type(2)';
    const user2LastName = 'tbody tr:nth-of-type(2) td:nth-of-type(3)';
    const user2CampusId = 'tbody tr:nth-of-type(2) td:nth-of-type(4)';
    const user2Email = 'tbody tr:nth-of-type(2) td:nth-of-type(5)';

    let user1 = EmberObject.create({
      firstName: 'Jasper',
      lastName: 'Dog',
      campusId: '1234',
      email: 'testemail',
      enabled: true,
    });
    let user2 = EmberObject.create({
      firstName: 'Jackson',
      lastName: 'Doggy',
      campusId: '123',
      email: 'testemail2',
      enabled: false,
    });

    this.set('users', [user1, user2]);
    this.set('nothing', parseInt);

    await render(hbs`{{learnergroup-user-manager
      learnerGroupId=1
      learnerGroupTitle='this group'
      topLevelGroupTitle='top group'
      cohortTitle='this cohort'
      users=users
      sortBy='lastName'
      setSortBy=(action nothing)
      isEditing=false
      addUserToGroup=(action nothing)
      removeUserFromGroup=(action nothing)
      addUsersToGroup=(action nothing)
      removeUsersFromGroup=(action nothing)
    }}`);

    assert.dom('.title').hasText('Members (2)');
    assert.dom(userList).exists({ count: 2 });
    assert.dom(user1FirstName).hasText('Jasper');
    assert.dom(user1LastName).hasText('Dog');
    assert.dom(user1CampusId).hasText('1234');
    assert.dom(user1Email).hasText('testemail');

    assert.dom(user2Disabled).exists({ count: 1 });
    assert.dom(user2FirstName).hasText('Jackson');
    assert.dom(user2LastName).hasText('Doggy');
    assert.dom(user2CampusId).hasText('123');
    assert.dom(user2Email).hasText('testemail2');
  });

  test('it renders when editing', async function(assert) {
    const userList = 'tbody tr';
    const user1CheckBox = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input[type=checkbox]';
    const user1FirstName = 'tbody tr:nth-of-type(1) td:nth-of-type(2)';
    const user1LastName = 'tbody tr:nth-of-type(1) td:nth-of-type(3)';
    const user1CampusId = 'tbody tr:nth-of-type(1) td:nth-of-type(4)';
    const user1Email = 'tbody tr:nth-of-type(1) td:nth-of-type(5)';
    const user2Disabled = 'tbody tr:nth-of-type(2) td:nth-of-type(1) svg';
    const user2FirstName = 'tbody tr:nth-of-type(2) td:nth-of-type(2)';
    const user2LastName = 'tbody tr:nth-of-type(2) td:nth-of-type(3)';
    const user2CampusId = 'tbody tr:nth-of-type(2) td:nth-of-type(4)';
    const user2Email = 'tbody tr:nth-of-type(2) td:nth-of-type(5)';

    let user1 = EmberObject.create({
      firstName: 'Jasper',
      lastName: 'Dog',
      campusId: '1234',
      email: 'testemail',
      enabled: true,
      lowestGroupInTree: EmberObject.create({
        id: 1
      }),
    });
    let user2 = EmberObject.create({
      firstName: 'Jackson',
      lastName: 'Doggy',
      campusId: '123',
      email: 'testemail2',
      enabled: false,
      lowestGroupInTree: EmberObject.create({
        id: 1
      }),
    });

    this.set('users', [user1, user2]);
    this.set('nothing', parseInt);

    await render(hbs`{{learnergroup-user-manager
      learnerGroupId=1
      learnerGroupTitle='this group'
      topLevelGroupTitle='top group'
      cohortTitle='this cohort'
      users=users
      sortBy='lastName'
      setSortBy=(action nothing)
      isEditing=true
      addUserToGroup=(action nothing)
      removeUserFromGroup=(action nothing)
      addUsersToGroup=(action nothing)
      removeUsersFromGroup=(action nothing)
    }}`);

    assert.ok(find('[data-test-group-members]').textContent.includes('Members of current group (2)'));
    assert.ok(find('[data-test-all-other-members]').textContent.includes('All other members of top group (0)'));
    assert.dom(userList).exists({ count: 2 });
    assert.dom(user1CheckBox).exists({ count: 1 });
    assert.dom(user1CheckBox).isNotChecked();
    assert.dom(user1FirstName).hasText('Jasper');
    assert.dom(user1LastName).hasText('Dog');
    assert.dom(user1CampusId).hasText('1234');
    assert.dom(user1Email).hasText('testemail');

    assert.dom(user2Disabled).exists({ count: 1 });
    assert.dom(user2FirstName).hasText('Jackson');
    assert.dom(user2LastName).hasText('Doggy');
    assert.dom(user2CampusId).hasText('123');
    assert.dom(user2Email).hasText('testemail2');
  });

  test('sort by firstName', async function(assert) {
    const userList = 'tbody tr';
    const user1FirstName = 'tbody tr:nth-of-type(1) td:nth-of-type(2)';
    const user2FirstName = 'tbody tr:nth-of-type(2) td:nth-of-type(2)';

    let user1 = EmberObject.create({
      firstName: 'Jasper',
      lowestGroupInTree: EmberObject.create({
        id: 1
      }),
    });
    let user2 = EmberObject.create({
      firstName: 'Jackson',
      lowestGroupInTree: EmberObject.create({
        id: 1
      }),
    });

    this.set('users', [user1, user2]);
    this.set('nothing', parseInt);

    await render(hbs`{{learnergroup-user-manager
      learnerGroupId=1
      learnerGroupTitle='this group'
      topLevelGroupTitle='top group'
      cohortTitle='this cohort'
      users=users
      sortBy='firstName'
      setSortBy=(action nothing)
      isEditing=true
      addUserToGroup=(action nothing)
      removeUserFromGroup=(action nothing)
      addUsersToGroup=(action nothing)
      removeUsersFromGroup=(action nothing)
    }}`);


    assert.dom(userList).exists({ count: 2 });
    assert.dom(user1FirstName).hasText('Jackson');
    assert.dom(user2FirstName).hasText('Jasper');
  });

  test('add multiple users', async function(assert) {
    assert.expect(5);
    const user1CheckBox = 'table:nth-of-type(2) tbody tr:nth-of-type(1) td:nth-of-type(1) input[type=checkbox]';
    const button = 'button.done';

    let user1 = EmberObject.create({
      enabled: true,
      lowestGroupInTree: EmberObject.create({
        id: 1
      }),
    });

    this.set('users', [ObjectProxy.create({content: user1})]);
    this.set('nothing', parseInt);
    this.set('addMany', ([user]) => {
      assert.equal(user, user1);
    });

    await render(hbs`{{learnergroup-user-manager
      learnerGroupId=1
      learnerGroupTitle='this group'
      topLevelGroupTitle='top group'
      cohortTitle='this cohort'
      users=users
      sortBy='lastName'
      setSortBy=(action nothing)
      isEditing=true
      addUserToGroup=(action nothing)
      removeUserFromGroup=(action nothing)
      addUsersToGroup=(action addMany)
      removeUsersFromGroup=(action nothing)
    }}`);

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

    let user1 = EmberObject.create({
      enabled: true,
      lowestGroupInTree: EmberObject.create({
        id: 1
      }),
    });

    this.set('users', [ObjectProxy.create({content: user1})]);
    this.set('nothing', parseInt);
    this.set('removeMany', ([user]) => {
      assert.equal(user, user1);
    });

    await render(hbs`{{learnergroup-user-manager
      learnerGroupId=1
      learnerGroupTitle='this group'
      topLevelGroupTitle='top group'
      cohortTitle='this cohort'
      users=users
      sortBy='lastName'
      setSortBy=(action nothing)
      isEditing=true
      addUserToGroup=(action nothing)
      removeUserFromGroup=(action nothing)
      addUsersToGroup=(action nothing)
      removeUsersFromGroup=(action removeMany)
    }}`);

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
    const action = 'table:nth-of-type(2) tbody tr:nth-of-type(1) td:nth-of-type(7) .clickable';

    let user1 = EmberObject.create({
      enabled: true,
      lowestGroupInTree: EmberObject.create({
        id: 1
      }),
    });

    this.set('users', [ObjectProxy.create({content: user1})]);
    this.set('nothing', parseInt);
    this.set('removeOne', (user) => {
      assert.equal(user1, user);
    });

    await render(hbs`{{learnergroup-user-manager
      learnerGroupId=1
      learnerGroupTitle='this group'
      topLevelGroupTitle='top group'
      cohortTitle='this cohort'
      users=users
      sortBy='lastName'
      setSortBy=(action nothing)
      isEditing=true
      addUserToGroup=(action nothing)
      removeUserFromGroup=(action removeOne)
      addUsersToGroup=(action nothing)
      removeUsersFromGroup=(action nothing)
    }}`);

    await click(action);

  });

  test('add single user', async function(assert) {
    assert.expect(1);
    const action = 'table:nth-of-type(3) tbody tr:nth-of-type(1) td:nth-of-type(7) .clickable';

    let user1 = EmberObject.create({
      enabled: true,
      lowestGroupInTree: EmberObject.create({
        id: 2
      }),
    });

    this.set('users', [ObjectProxy.create({content: user1})]);
    this.set('nothing', parseInt);
    this.set('addOne', (user) => {
      assert.equal(user1, user);
    });

    await render(hbs`{{learnergroup-user-manager
      learnerGroupId=1
      learnerGroupTitle='this group'
      topLevelGroupTitle='top group'
      cohortTitle='this cohort'
      users=users
      sortBy='lastName'
      setSortBy=(action nothing)
      isEditing=true
      addUserToGroup=(action addOne)
      removeUserFromGroup=(action nothing)
      addUsersToGroup=(action nothing)
      removeUsersFromGroup=(action nothing)
    }}`);

    await click(action);

  });

  test('when users are selected single action is disabled', async function(assert) {
    assert.expect(2);
    const user1CheckBox = 'table:nth-of-type(2) tbody tr:nth-of-type(1) td:nth-of-type(1) input[type=checkbox]';
    const action1 = 'table:nth-of-type(2) tbody tr:nth-of-type(1) td:nth-of-type(7) .clickable';
    const action2 = 'table:nth-of-type(3) tbody tr:nth-of-type(1) td:nth-of-type(7) .clickable';

    let user1 = EmberObject.create({
      enabled: true,
      lowestGroupInTree: EmberObject.create({
        id: 1
      }),
    });

    let user2 = EmberObject.create({
      enabled: true,
      lowestGroupInTree: EmberObject.create({
        id: 2
      }),
    });

    this.set('users', [ObjectProxy.create({content: user1}), ObjectProxy.create({content: user2})]);
    this.set('nothing', parseInt);

    await render(hbs`{{learnergroup-user-manager
      learnerGroupId=1
      learnerGroupTitle='this group'
      topLevelGroupTitle='top group'
      cohortTitle='this cohort'
      users=users
      sortBy='lastName'
      setSortBy=(action nothing)
      isEditing=true
      addUserToGroup=(action nothing)
      removeUserFromGroup=(action nothing)
      addUsersToGroup=(action nothing)
      removeUsersFromGroup=(action nothing)
    }}`);

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

    let user1 = EmberObject.create({
      enabled: true,
      lowestGroupInTree: EmberObject.create({
        id: 1
      }),
    });
    let user2 = EmberObject.create({
      enabled: true,
      lowestGroupInTree: EmberObject.create({
        id: 1
      }),
    });

    this.set('users', [ObjectProxy.create({content: user1}), ObjectProxy.create({content: user2})]);
    this.set('nothing', parseInt);
    this.set('addMany', ([userA, userB]) => {
      assert.equal(user1, userA);
      assert.equal(user2, userB);
    });

    await render(hbs`{{learnergroup-user-manager
      learnerGroupId=1
      learnerGroupTitle='this group'
      topLevelGroupTitle='top group'
      cohortTitle='this cohort'
      users=users
      sortBy='lastName'
      setSortBy=(action nothing)
      isEditing=true
      addUserToGroup=(action nothing)
      removeUserFromGroup=(action nothing)
      addUsersToGroup=(action addMany)
      removeUsersFromGroup=(action nothing)
    }}`);

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

    let user1 = EmberObject.create({
      enabled: true,
      lowestGroupInTree: EmberObject.create({
        id: 1
      }),
    });
    let user2 = EmberObject.create({
      enabled: true,
      lowestGroupInTree: EmberObject.create({
        id: 1
      }),
    });

    this.set('users', [ObjectProxy.create({content: user1}), ObjectProxy.create({content: user2})]);
    this.set('nothing', parseInt);

    await render(hbs`{{learnergroup-user-manager
      learnerGroupId=1
      learnerGroupTitle='this group'
      topLevelGroupTitle='top group'
      cohortTitle='this cohort'
      users=users
      sortBy='lastName'
      setSortBy=(action nothing)
      isEditing=true
      addUserToGroup=(action nothing)
      removeUserFromGroup=(action nothing)
      addUsersToGroup=(action nothing)
      removeUsersFromGroup=(action nothing)
    }}`);

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

    let user1 = EmberObject.create({
      enabled: false,
      lowestGroupInTree: EmberObject.create({
        id: 1
      }),
    });

    this.set('users', [ObjectProxy.create({content: user1})]);
    this.set('nothing', parseInt);

    await render(hbs`{{learnergroup-user-manager
      learnerGroupId=1
      learnerGroupTitle='this group'
      topLevelGroupTitle='top group'
      cohortTitle='this cohort'
      users=users
      sortBy='lastName'
      setSortBy=(action nothing)
      isEditing=true
      addUserToGroup=(action nothing)
      removeUserFromGroup=(action nothing)
      addUsersToGroup=(action nothing)
      removeUsersFromGroup=(action nothing)
    }}`);

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

    let user1 = EmberObject.create({
      enabled: false,
      lowestGroupInTree: EmberObject.create({
        id: 1
      }),
    });

    this.set('users', [ObjectProxy.create({content: user1})]);
    this.set('nothing', parseInt);

    await render(hbs`{{learnergroup-user-manager
      learnerGroupId=1
      learnerGroupTitle='this group'
      topLevelGroupTitle='top group'
      cohortTitle='this cohort'
      users=users
      sortBy='lastName'
      setSortBy=(action nothing)
      isEditing=true
      addUserToGroup=(action nothing)
      removeUserFromGroup=(action nothing)
      addUsersToGroup=(action nothing)
      removeUsersFromGroup=(action nothing)
    }}`);

    assert.equal(0, findAll(userCheckbox).length, 'Checkbox is not visible');
    assert.equal(1, findAll(userDisabledIcon).length, 'User is labeled as disabled.');
  });
});
