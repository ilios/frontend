import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

const { Object } = Ember;

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
  this.on('nothing', parseInt);

  this.render(hbs`{{learnergroup-cohort-user-manager
    users=users
    learnerGroupTitle='this group'
    topLevelGroupTitle='top level group'
    sortBy='lastName'
    setSortBy=(action 'nothing')
    addUserToGroup=(action 'nothing')
    addUsersToGroup=(action 'nothing')
  }}`);


  assert.equal(this.$('.detail-title').text().trim(), 'Cohort Members NOT assigned to top level group  (2)');
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
  });
  let user2 = Object.create({
    firstName: 'Jackson',
  });

  this.set('users', [user1, user2]);
  this.on('nothing', parseInt);

  this.render(hbs`{{learnergroup-cohort-user-manager
    users=users
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

test('add multiple users', function(assert) {
  assert.expect(2);
  const user1CheckBox = 'tbody tr:eq(0) td:eq(0) input[type=checkbox]';
  const button = 'button.done';

  let user1 = Object.create({
    enabled: true,
  });

  this.set('users', [user1]);
  this.on('nothing', parseInt);
  this.on('addMany', ([user]) => {
    assert.equal(user1, user);
  });

  this.render(hbs`{{learnergroup-cohort-user-manager
    users=users
    learnerGroupTitle='this group'
    topLevelGroupTitle='top level group'
    sortBy='firstName'
    setSortBy=(action 'nothing')
    addUserToGroup=(action 'nothing')
    addUsersToGroup=(action 'addMany')
  }}`);

  this.$(user1CheckBox).click();
  assert.equal(this.$(button).text().trim(), 'Move learner to this group');
  this.$(button).click();

});

test('add single user', function(assert) {
  assert.expect(1);
  const action = 'tbody tr:eq(0) td:eq(5) .clickable';

  let user1 = Object.create({
    enabled: true,
  });

  this.set('users', [user1]);
  this.on('nothing', parseInt);
  this.on('addOne', (user) => {
    assert.equal(user1, user);
  });

  this.render(hbs`{{learnergroup-cohort-user-manager
    users=users
    learnerGroupTitle='this group'
    topLevelGroupTitle='top level group'
    sortBy='firstName'
    setSortBy=(action 'nothing')
    addUserToGroup=(action 'addOne')
    addUsersToGroup=(action 'nothing')
  }}`);

  this.$(action).click();

});

test('checkall', function(assert) {
  assert.expect(5);
  const checkAllBox = 'thead tr:eq(0) th:eq(0) input[type=checkbox]';
  const user1CheckBox = 'tbody tr:eq(0) td:eq(0) input[type=checkbox]';
  const user2CheckBox = 'tbody tr:eq(0) td:eq(0) input[type=checkbox]';
  const button = 'button.done';

  let user1 = Object.create({
    enabled: true,
  });
  let user2 = Object.create({
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
  this.$(button).click();

});
