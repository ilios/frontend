import EmberObject from '@ember/object';
import { getOwner } from '@ember/application';
import Service from '@ember/service';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

moduleForComponent('learnergroup-cohort-user-manager', 'Integration | Component | learnergroup cohort user manager', {
  integration: true
});

test('it renders', function(assert) {
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
  });
  let user2 = EmberObject.create({
    firstName: 'Jackson',
    lastName: 'Doggy',
    campusId: '123',
    email: 'testemail2',
    enabled: false,
  });

  this.set('users', [user1, user2]);
  this.on('nothing', parseInt);

  this.render(hbs`{{learnergroup-cohort-user-manager
    users=users
    canUpdate=true
    learnerGroupTitle='this group'
    topLevelGroupTitle='top level group'
    sortBy='lastName'
    setSortBy=(action 'nothing')
    addUserToGroup=(action 'nothing')
    addUsersToGroup=(action 'nothing')
  }}`);


  assert.equal(this.$('.title').text().trim(), 'Cohort Members NOT assigned to top level group  (2)');
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

  let user1 = EmberObject.create({
    firstName: 'Jasper',
  });
  let user2 = EmberObject.create({
    firstName: 'Jackson',
  });

  this.set('users', [user1, user2]);
  this.on('nothing', parseInt);

  this.render(hbs`{{learnergroup-cohort-user-manager
    users=users
    canUpdate=true
    learnerGroupTitle='this group'
    topLevelGroupTitle='top level group'
    sortBy='firstName'
    setSortBy=(action 'nothing')
    addUserToGroup=(action 'nothing')
    addUsersToGroup=(action 'nothing')
  }}`);


  assert.equal(this.$(userList).length, 2);
  assert.equal(this.$(user1FirstName).text().trim(), 'Jackson');
  assert.equal(this.$(user2FirstName).text().trim(), 'Jasper');
});

test('add multiple users', async function(assert) {
  assert.expect(4);
  const user1CheckBox = 'tbody tr:eq(0) td:eq(0) input[type=checkbox]';
  const button = 'button.done';

  let user1 = EmberObject.create({
    enabled: true,
  });

  this.set('users', [user1]);
  this.on('nothing', parseInt);
  this.on('addMany', ([user]) => {
    assert.equal(user1, user);
  });

  this.render(hbs`{{learnergroup-cohort-user-manager
    users=users
    canUpdate=true
    learnerGroupTitle='this group'
    topLevelGroupTitle='top level group'
    sortBy='firstName'
    setSortBy=(action 'nothing')
    addUserToGroup=(action 'nothing')
    addUsersToGroup=(action 'addMany')
  }}`);

  assert.equal(this.$(button).length, 0);
  this.$(user1CheckBox).click();
  assert.equal(this.$(button).text().trim(), 'Move learner to this group');
  this.$(button).click();
  await wait();
  assert.equal(this.$(button).length, 0, 'button is hidden after save');
});

test('add single user', function(assert) {
  assert.expect(1);
  const action = 'tbody tr:eq(0) td:eq(5) .clickable';

  let user1 = EmberObject.create({
    enabled: true,
  });

  this.set('users', [user1]);
  this.on('nothing', parseInt);
  this.on('addOne', (user) => {
    assert.equal(user1, user);
  });

  this.render(hbs`{{learnergroup-cohort-user-manager
    users=users
    canUpdate=true
    learnerGroupTitle='this group'
    topLevelGroupTitle='top level group'
    sortBy='firstName'
    setSortBy=(action 'nothing')
    addUserToGroup=(action 'addOne')
    addUsersToGroup=(action 'nothing')
  }}`);

  return wait(this.$(action).click());

});

test('when users are selected single action is disabled', function(assert) {
  assert.expect(1);
  const user1CheckBox = 'tbody tr:eq(0) td:eq(0) input[type=checkbox]';
  const action = 'tbody tr:eq(0) td:eq(5) .clickable';

  let user1 = EmberObject.create({
    enabled: true,
  });

  this.set('users', [user1]);
  this.on('nothing', parseInt);

  this.render(hbs`{{learnergroup-cohort-user-manager
    users=users
    canUpdate=true
    learnerGroupTitle='this group'
    topLevelGroupTitle='top level group'
    sortBy='firstName'
    setSortBy=(action 'nothing')
    addUserToGroup=(action 'nothing')
    addUsersToGroup=(action 'nothing')
  }}`);

  this.$(user1CheckBox).click();
  assert.equal(this.$(action).length, 0);

});

test('checkall', function(assert) {
  assert.expect(5);
  const checkAllBox = 'thead tr:eq(0) th:eq(0) input[type=checkbox]';
  const user1CheckBox = 'tbody tr:eq(0) td:eq(0) input[type=checkbox]';
  const user2CheckBox = 'tbody tr:eq(1) td:eq(0) input[type=checkbox]';
  const button = 'button.done';

  let user1 = EmberObject.create({
    enabled: true,
  });
  let user2 = EmberObject.create({
    enabled: true,
  });

  this.set('users', [user1, user2]);
  this.on('nothing', parseInt);
  this.on('addMany', ([userA, userB]) => {
    assert.equal(user1, userA);
    assert.equal(user2, userB);
  });

  this.render(hbs`{{learnergroup-cohort-user-manager
    users=users
    canUpdate=true
    learnerGroupTitle='this group'
    topLevelGroupTitle='top level group'
    sortBy='firstName'
    setSortBy=(action 'nothing')
    addUserToGroup=(action 'nothing')
    addUsersToGroup=(action 'addMany')
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

  let user1 = EmberObject.create({
    enabled: true,
  });
  let user2 = EmberObject.create({
    enabled: true,
  });

  this.set('users', [user1, user2]);
  this.on('nothing', parseInt);

  this.render(hbs`{{learnergroup-cohort-user-manager
    users=users
    canUpdate=true
    learnerGroupTitle='this group'
    topLevelGroupTitle='top level group'
    sortBy='firstName'
    setSortBy=(action 'nothing')
    addUserToGroup=(action 'nothing')
    addUsersToGroup=(action 'nothing')
  }}`);

  this.$(user1CheckBox).click();
  assert.ok(this.$(checkAllBox).prop('indeterminate'));
  this.$(user2CheckBox).click();
  assert.ok(this.$(checkAllBox).prop('checked'));
  this.$(checkAllBox).click();
  assert.notOk(this.$(user1CheckBox).prop('checked'));
  assert.notOk(this.$(user2CheckBox).prop('checked'));
});

test('root users can manage disabled users', function(assert) {
  assert.expect(2);
  const currentUserMock = Service.extend({
    isRoot: true,
  });
  getOwner(this).register('service:currentUser', currentUserMock);

  const userCheckbox = 'tbody tr:eq(0) td:eq(0) input[type=checkbox]';
  const userDisabledIcon = 'tbody tr:eq(0) td:eq(0) .fa-user-times';


  let user1 = EmberObject.create({
    enabled: false,
  });

  this.set('users', [user1]);
  this.on('nothing', parseInt);

  this.render(hbs`{{learnergroup-cohort-user-manager
    users=users
    canUpdate=true
    learnerGroupTitle='this group'
    topLevelGroupTitle='top level group'
    sortBy='firstName'
    setSortBy=(action 'nothing')
    addUserToGroup=(action 'nothing')
    addUsersToGroup=(action 'nothing')
  }}`);

  assert.equal(1, this.$(userCheckbox).length, 'Checkbox visible');
  assert.equal(1, this.$(userDisabledIcon).length, 'User is labeled as disabled.');
});

test('non-root users cannot manage disabled users', function(assert) {
  assert.expect(2);
  const currentUserMock = Service.extend({
    isRoot: false,
  });
  getOwner(this).register('service:currentUser', currentUserMock);

  const userCheckbox = 'tbody tr:eq(0) td:eq(0) input[type=checkbox]';
  const userDisabledIcon = 'tbody tr:eq(0) td:eq(0) .fa-user-times';


  let user1 = EmberObject.create({
    enabled: false,
  });

  this.set('users', [user1]);
  this.on('nothing', parseInt);

  this.render(hbs`{{learnergroup-cohort-user-manager
    users=users
    canUpdate=true
    learnerGroupTitle='this group'
    topLevelGroupTitle='top level group'
    sortBy='firstName'
    setSortBy=(action 'nothing')
    addUserToGroup=(action 'nothing')
    addUsersToGroup=(action 'nothing')
  }}`);

  assert.equal(0, this.$(userCheckbox).length, 'Checkbox not visible');
  assert.equal(1, this.$(userDisabledIcon).length, 'User is labeled as disabled.');
});
