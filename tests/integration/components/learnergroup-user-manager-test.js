import EmberObject from '@ember/object';
import Service from '@ember/service';
import ObjectProxy from '@ember/object/proxy';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click, findAll, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | learnergroup user manager', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    const userList = 'tbody tr';
    const user1FirstName = 'tbody tr:eq(0) td:eq(1)';
    const user1LastName = 'tbody tr:eq(0) td:eq(2)';
    const user1CampusId = 'tbody tr:eq(0) td:eq(3)';
    const user1Email = 'tbody tr:eq(0) td:eq(4)';
    const user2Disabled = 'tbody tr:eq(1) td:eq(0) svg';
    const user2FirstName = 'tbody tr:eq(1) td:eq(1)';
    const user2LastName = 'tbody tr:eq(1) td:eq(2)';
    const user2CampusId = 'tbody tr:eq(1) td:eq(3)';
    const user2Email = 'tbody tr:eq(1) td:eq(4)';

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

    assert.equal(find('.title').textContent.trim(), 'Members (2)');
    assert.equal(findAll(userList).length, 2);
    assert.equal(this.$(user1FirstName).text().trim(), 'Jasper');
    assert.equal(this.$(user1LastName).text().trim(), 'Dog');
    assert.equal(this.$(user1CampusId).text().trim(), '1234');
    assert.equal(this.$(user1Email).text().trim(), 'testemail');

    assert.equal(this.$(user2Disabled).length, 1);
    assert.equal(this.$(user2FirstName).text().trim(), 'Jackson');
    assert.equal(this.$(user2LastName).text().trim(), 'Doggy');
    assert.equal(this.$(user2CampusId).text().trim(), '123');
    assert.equal(this.$(user2Email).text().trim(), 'testemail2');
  });

  test('it renders when editing', async function(assert) {
    const userList = 'tbody tr';
    const user1CheckBox = 'tbody tr:eq(0) td:eq(0) input[type=checkbox]';
    const user1FirstName = 'tbody tr:eq(0) td:eq(1)';
    const user1LastName = 'tbody tr:eq(0) td:eq(2)';
    const user1CampusId = 'tbody tr:eq(0) td:eq(3)';
    const user1Email = 'tbody tr:eq(0) td:eq(4)';
    const user2Disabled = 'tbody tr:eq(1) td:eq(0) svg';
    const user2FirstName = 'tbody tr:eq(1) td:eq(1)';
    const user2LastName = 'tbody tr:eq(1) td:eq(2)';
    const user2CampusId = 'tbody tr:eq(1) td:eq(3)';
    const user2Email = 'tbody tr:eq(1) td:eq(4)';

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

    assert.notEqual(find('.title').textContent.search(/Members of current group \(2\)/), -1);
    assert.notEqual(find('.title').textContent.search(/All other members of top group \(0\)/), -1);
    assert.equal(findAll(userList).length, 2);
    assert.equal(this.$(user1CheckBox).length, 1);
    assert.notOk(this.$(user1CheckBox).prop('checked'));
    assert.equal(this.$(user1FirstName).text().trim(), 'Jasper');
    assert.equal(this.$(user1LastName).text().trim(), 'Dog');
    assert.equal(this.$(user1CampusId).text().trim(), '1234');
    assert.equal(this.$(user1Email).text().trim(), 'testemail');

    assert.equal(this.$(user2Disabled).length, 1);
    assert.equal(this.$(user2FirstName).text().trim(), 'Jackson');
    assert.equal(this.$(user2LastName).text().trim(), 'Doggy');
    assert.equal(this.$(user2CampusId).text().trim(), '123');
    assert.equal(this.$(user2Email).text().trim(), 'testemail2');
  });

  test('sort by firstName', async function(assert) {
    const userList = 'tbody tr';
    const user1FirstName = 'tbody tr:eq(0) td:eq(1)';
    const user2FirstName = 'tbody tr:eq(1) td:eq(1)';

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


    assert.equal(findAll(userList).length, 2);
    assert.equal(this.$(user1FirstName).text().trim(), 'Jackson');
    assert.equal(this.$(user2FirstName).text().trim(), 'Jasper');
  });

  test('add multiple users', async function(assert) {
    assert.expect(5);
    const user1CheckBox = 'table:eq(1) tbody tr:eq(0) td:eq(0) input[type=checkbox]';
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

    assert.equal(findAll(button).length, 0);
    this.$(user1CheckBox).click();
    assert.ok(this.$(user1CheckBox).prop('checked'));
    assert.equal(find(button).textContent.trim(), 'Move learner to this group');
    await click(button);
    await settled();
    assert.equal(findAll(button).length, 0);

  });

  test('remove multiple users', async function(assert) {
    assert.expect(5);
    const user1CheckBox = 'table:eq(1) tbody tr:eq(0) td:eq(0) input[type=checkbox]';
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

    assert.equal(findAll(button).length, 0);
    this.$(user1CheckBox).click();
    assert.ok(this.$(user1CheckBox).prop('checked'));
    assert.equal(find(button).textContent.trim(), 'Remove learner to this cohort');
    await click(button);
    await settled();
    assert.equal(findAll(button).length, 0);
  });

  test('remove single user', async function(assert) {
    assert.expect(1);
    const action = 'table:eq(1) tbody tr:eq(0) td:eq(6) .clickable';

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

    return settled(this.$(action).click());

  });

  test('add single user', async function(assert) {
    assert.expect(1);
    const action = 'table:eq(2) tbody tr:eq(0) td:eq(6) .clickable';

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

    return settled(this.$(action).click());

  });

  test('when users are selected single action is disabled', async function(assert) {
    assert.expect(2);
    const user1CheckBox = 'table:eq(1) tbody tr:eq(0) td:eq(0) input[type=checkbox]';
    const action1 = 'table:eq(1) tbody tr:eq(0) td:eq(6) .clickable';
    const action2 = 'table:eq(2) tbody tr:eq(0) td:eq(6) .clickable';

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

    this.$(user1CheckBox).click();
    assert.equal(this.$(action1).length, 0);
    assert.equal(this.$(action2).length, 0);

  });

  test('checkall', async function(assert) {
    assert.expect(5);
    const checkAllBox = 'thead tr:eq(0) th:eq(0) input[type=checkbox]';
    const user1CheckBox = 'tbody tr:eq(0) td:eq(0) input[type=checkbox]';
    const user2CheckBox = 'tbody tr:eq(1) td:eq(0) input[type=checkbox]';
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

    this.$(checkAllBox).click();
    assert.ok(this.$(user1CheckBox).prop('checked'));
    assert.ok(this.$(user2CheckBox).prop('checked'));
    assert.equal(find(button).textContent.trim(), 'Move 2 learners to this group');
    return settled(await click(button));

  });

  test('checking one puts checkall box into indeterminate state', async function(assert) {
    assert.expect(4);
    const checkAllBox = 'thead tr:eq(0) th:eq(0) input[type=checkbox]';
    const user1CheckBox = 'tbody tr:eq(0) td:eq(0) input[type=checkbox]';
    const user2CheckBox = 'tbody tr:eq(1) td:eq(0) input[type=checkbox]';

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

    this.$(user1CheckBox).click();
    assert.ok(this.$(checkAllBox).prop('indeterminate'));
    this.$(user2CheckBox).click();
    assert.ok(this.$(checkAllBox).prop('checked'));
    this.$(checkAllBox).click();
    assert.notOk(this.$(user1CheckBox).prop('checked'));
    assert.notOk(this.$(user2CheckBox).prop('checked'));
  });

  test('root users can manage disabled users', async function(assert) {
    assert.expect(2);
    const currentUserMock = Service.extend({
      isRoot: true,
    });
    this.owner.register('service:currentUser', currentUserMock);

    const userCheckbox = 'tbody tr:eq(0) td:eq(0) input[type=checkbox]';
    const userDisabledIcon = 'tbody tr:eq(0) td:eq(0) .fa-user-times';

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

    assert.equal(1, this.$(userCheckbox).length, 'Checkbox visible');
    assert.equal(1, this.$(userDisabledIcon).length, 'User is labeled as disabled.');
  });

  test('non-root users cannot manage disabled users', async function(assert) {
    assert.expect(2);
    const currentUserMock = Service.extend({
      isRoot: false,
    });
    this.owner.register('service:currentUser', currentUserMock);

    const userCheckbox = 'tbody tr:eq(0) td:eq(0) input[type=checkbox]';
    const userDisabledIcon = 'tbody tr:eq(0) td:eq(0) .fa-user-times';

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

    assert.equal(0, this.$(userCheckbox).length, 'Checkbox is not visible');
    assert.equal(1, this.$(userDisabledIcon).length, 'User is labeled as disabled.');
  });
});
