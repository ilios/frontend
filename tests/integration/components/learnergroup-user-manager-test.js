import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

const { Object, ObjectProxy } = Ember;

moduleForComponent('learnergroup-user-manager', 'Integration | Component | learnergroup user manager', {
  integration: true
});

test('it renders', function(assert) {
  const userList = 'tbody tr';
  const user1FirstName = 'tbody tr:eq(0) td:eq(1)';
  const user1LastName = 'tbody tr:eq(0) td:eq(2)';
  const user1CampusId = 'tbody tr:eq(0) td:eq(3)';
  const user1Email = 'tbody tr:eq(0) td:eq(4)';
  const user2Disabled = 'tbody tr:eq(1) td:eq(0) i';
  const user2FirstName = 'tbody tr:eq(1) td:eq(1)';
  const user2LastName = 'tbody tr:eq(1) td:eq(2)';
  const user2CampusId = 'tbody tr:eq(1) td:eq(3)';
  const user2Email = 'tbody tr:eq(1) td:eq(4)';

  let user1 = Object.create({
    firstName: 'Jasper',
    lastName: 'Dog',
    campusId: '1234',
    email: 'testemail',
    enabled: true,
  });
  let user2 = Object.create({
    firstName: 'Jackson',
    lastName: 'Doggy',
    campusId: '123',
    email: 'testemail2',
    enabled: false,
  });

  this.set('users', [user1, user2]);
  this.set('nothing', parseInt);

  this.render(hbs`{{learnergroup-user-manager
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

  assert.equal(this.$('.title').text().trim(), 'Members (2)');
  assert.equal(this.$(userList).length, 2);
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

test('it renders when editing', function(assert) {
  const userList = 'tbody tr';
  const user1CheckBox = 'tbody tr:eq(0) td:eq(0) input[type=checkbox]';
  const user1FirstName = 'tbody tr:eq(0) td:eq(1)';
  const user1LastName = 'tbody tr:eq(0) td:eq(2)';
  const user1CampusId = 'tbody tr:eq(0) td:eq(3)';
  const user1Email = 'tbody tr:eq(0) td:eq(4)';
  const user2Disabled = 'tbody tr:eq(1) td:eq(0) i';
  const user2FirstName = 'tbody tr:eq(1) td:eq(1)';
  const user2LastName = 'tbody tr:eq(1) td:eq(2)';
  const user2CampusId = 'tbody tr:eq(1) td:eq(3)';
  const user2Email = 'tbody tr:eq(1) td:eq(4)';

  let user1 = Object.create({
    firstName: 'Jasper',
    lastName: 'Dog',
    campusId: '1234',
    email: 'testemail',
    enabled: true,
    lowestGroupInTree: Object.create({
      id: 1
    }),
  });
  let user2 = Object.create({
    firstName: 'Jackson',
    lastName: 'Doggy',
    campusId: '123',
    email: 'testemail2',
    enabled: false,
    lowestGroupInTree: Object.create({
      id: 1
    }),
  });

  this.set('users', [user1, user2]);
  this.set('nothing', parseInt);

  this.render(hbs`{{learnergroup-user-manager
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

  assert.notEqual(this.$('.title').text().search(/Members of current group \(2\)/), -1);
  assert.notEqual(this.$('.title').text().search(/All other members of top group \(0\)/), -1);
  assert.equal(this.$(userList).length, 2);
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

test('sort by firstName', function(assert) {
  const userList = 'tbody tr';
  const user1FirstName = 'tbody tr:eq(0) td:eq(1)';
  const user2FirstName = 'tbody tr:eq(1) td:eq(1)';

  let user1 = Object.create({
    firstName: 'Jasper',
    lowestGroupInTree: Object.create({
      id: 1
    }),
  });
  let user2 = Object.create({
    firstName: 'Jackson',
    lowestGroupInTree: Object.create({
      id: 1
    }),
  });

  this.set('users', [user1, user2]);
  this.set('nothing', parseInt);

  this.render(hbs`{{learnergroup-user-manager
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


  assert.equal(this.$(userList).length, 2);
  assert.equal(this.$(user1FirstName).text().trim(), 'Jackson');
  assert.equal(this.$(user2FirstName).text().trim(), 'Jasper');
});

test('add multiple users', function(assert) {
  assert.expect(3);
  const user1CheckBox = 'table:eq(1) tbody tr:eq(0) td:eq(0) input[type=checkbox]';
  const button = 'button.done';

  let user1 = Object.create({
    enabled: true,
    lowestGroupInTree: Object.create({
      id: 1
    }),
  });

  this.set('users', [ObjectProxy.create({content: user1})]);
  this.set('nothing', parseInt);
  this.set('addMany', ([user]) => {
    assert.equal(user, user1);
  });

  this.render(hbs`{{learnergroup-user-manager
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

  this.$(user1CheckBox).click();
  assert.ok(this.$(user1CheckBox).prop('checked'));
  assert.equal(this.$(button).text().trim(), 'Move learner to this group');
  return wait(this.$(button).click());

});

test('remove multiple users', function(assert) {
  assert.expect(3);
  const user1CheckBox = 'table:eq(1) tbody tr:eq(0) td:eq(0) input[type=checkbox]';
  const button = 'button.cancel';

  let user1 = Object.create({
    enabled: true,
    lowestGroupInTree: Object.create({
      id: 1
    }),
  });

  this.set('users', [ObjectProxy.create({content: user1})]);
  this.set('nothing', parseInt);
  this.set('removeMany', ([user]) => {
    assert.equal(user, user1);
  });

  this.render(hbs`{{learnergroup-user-manager
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

  this.$(user1CheckBox).click();
  assert.ok(this.$(user1CheckBox).prop('checked'));
  assert.equal(this.$(button).text().trim(), 'Remove learner to this cohort');
  return wait(this.$(button).click());

});

test('remove single user', function(assert) {
  assert.expect(1);
  const action = 'table:eq(1) tbody tr:eq(0) td:eq(6) .clickable';

  let user1 = Object.create({
    enabled: true,
    lowestGroupInTree: Object.create({
      id: 1
    }),
  });

  this.set('users', [ObjectProxy.create({content: user1})]);
  this.set('nothing', parseInt);
  this.set('removeOne', (user) => {
    assert.equal(user1, user);
  });

  this.render(hbs`{{learnergroup-user-manager
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

  return wait(this.$(action).click());

});

test('add single user', function(assert) {
  assert.expect(1);
  const action = 'table:eq(2) tbody tr:eq(0) td:eq(6) .clickable';

  let user1 = Object.create({
    enabled: true,
    lowestGroupInTree: Object.create({
      id: 2
    }),
  });

  this.set('users', [ObjectProxy.create({content: user1})]);
  this.set('nothing', parseInt);
  this.set('addOne', (user) => {
    assert.equal(user1, user);
  });

  this.render(hbs`{{learnergroup-user-manager
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

  return wait(this.$(action).click());

});

test('when users are selected single action is disabled', function(assert) {
  assert.expect(2);
  const user1CheckBox = 'table:eq(1) tbody tr:eq(0) td:eq(0) input[type=checkbox]';
  const action1 = 'table:eq(1) tbody tr:eq(0) td:eq(6) .clickable';
  const action2 = 'table:eq(2) tbody tr:eq(0) td:eq(6) .clickable';

  let user1 = Object.create({
    enabled: true,
    lowestGroupInTree: Object.create({
      id: 1
    }),
  });

  let user2 = Object.create({
    enabled: true,
    lowestGroupInTree: Object.create({
      id: 2
    }),
  });

  this.set('users', [ObjectProxy.create({content: user1}), ObjectProxy.create({content: user2})]);
  this.set('nothing', parseInt);

  this.render(hbs`{{learnergroup-user-manager
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

test('checkall', function(assert) {
  assert.expect(5);
  const checkAllBox = 'thead tr:eq(0) th:eq(0) input[type=checkbox]';
  const user1CheckBox = 'tbody tr:eq(0) td:eq(0) input[type=checkbox]';
  const user2CheckBox = 'tbody tr:eq(1) td:eq(0) input[type=checkbox]';
  const button = 'button.done';

  let user1 = Object.create({
    enabled: true,
    lowestGroupInTree: Object.create({
      id: 1
    }),
  });
  let user2 = Object.create({
    enabled: true,
    lowestGroupInTree: Object.create({
      id: 1
    }),
  });

  this.set('users', [ObjectProxy.create({content: user1}), ObjectProxy.create({content: user2})]);
  this.set('nothing', parseInt);
  this.set('addMany', ([userA, userB]) => {
    assert.equal(user1, userA);
    assert.equal(user2, userB);
  });

  this.render(hbs`{{learnergroup-user-manager
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
  assert.equal(this.$(button).text().trim(), 'Move 2 learners to this group');
  return wait(this.$(button).click());

});

test('checking one puts checkall box into indeterminate state', function(assert) {
  assert.expect(4);
  const checkAllBox = 'thead tr:eq(0) th:eq(0) input[type=checkbox]';
  const user1CheckBox = 'tbody tr:eq(0) td:eq(0) input[type=checkbox]';
  const user2CheckBox = 'tbody tr:eq(1) td:eq(0) input[type=checkbox]';

  let user1 = Object.create({
    enabled: true,
    lowestGroupInTree: Object.create({
      id: 1
    }),
  });
  let user2 = Object.create({
    enabled: true,
    lowestGroupInTree: Object.create({
      id: 1
    }),
  });

  this.set('users', [ObjectProxy.create({content: user1}), ObjectProxy.create({content: user2})]);
  this.set('nothing', parseInt);

  this.render(hbs`{{learnergroup-user-manager
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
