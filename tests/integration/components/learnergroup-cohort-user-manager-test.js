import EmberObject from '@ember/object';
import Service from '@ember/service';
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

module('Integration | Component | learnergroup cohort user manager', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
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
    });
    let user2 = EmberObject.create({
      firstName: 'Jackson',
      lastName: 'Doggy',
      campusId: '123',
      email: 'testemail2',
      enabled: false,
    });

    this.set('users', [user1, user2]);
    this.set('nothing', () => {});

    await render(hbs`{{learnergroup-cohort-user-manager
      users=users
      canUpdate=true
      learnerGroupTitle='this group'
      topLevelGroupTitle='top level group'
      sortBy='lastName'
      setSortBy=(action nothing)
      addUserToGroup=(action nothing)
      addUsersToGroup=(action nothing)
    }}`);


    assert.dom('.title').hasText('Cohort Members NOT assigned to top level group (2)');
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
    });
    let user2 = EmberObject.create({
      firstName: 'Jackson',
    });

    this.set('users', [user1, user2]);
    this.set('nothing', () => {});

    await render(hbs`{{learnergroup-cohort-user-manager
      users=users
      canUpdate=true
      learnerGroupTitle='this group'
      topLevelGroupTitle='top level group'
      sortBy='firstName'
      setSortBy=(action nothing)
      addUserToGroup=(action nothing)
      addUsersToGroup=(action nothing)
    }}`);


    assert.dom(userList).exists({ count: 2 });
    assert.dom(user1FirstName).hasText('Jackson');
    assert.dom(user2FirstName).hasText('Jasper');
  });

  test('add multiple users', async function(assert) {
    assert.expect(4);
    const user1CheckBox = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input[type=checkbox]';
    const button = 'button.done';

    let user1 = EmberObject.create({
      enabled: true,
    });

    this.set('users', [user1]);
    this.set('nothing', () => {});
    this.set('addMany', ([user]) => {
      assert.equal(user1, user);
    });

    await render(hbs`{{learnergroup-cohort-user-manager
      users=users
      canUpdate=true
      learnerGroupTitle='this group'
      topLevelGroupTitle='top level group'
      sortBy='firstName'
      setSortBy=(action nothing)
      addUserToGroup=(action nothing)
      addUsersToGroup=(action addMany)
    }}`);

    assert.dom(button).doesNotExist();
    await click(user1CheckBox);
    assert.dom(button).hasText('Move learner to this group');
    await click(button);
    await settled();
    assert.dom(button).doesNotExist('button is hidden after save');
  });

  test('add single user', async function(assert) {
    assert.expect(1);
    const action = 'tbody tr:nth-of-type(1) td:nth-of-type(6) .clickable';

    let user1 = EmberObject.create({
      enabled: true,
    });

    this.set('users', [user1]);
    this.set('nothing', () => {});
    this.set('addOne', user => {
      assert.equal(user1, user);
    });

    await render(hbs`{{learnergroup-cohort-user-manager
      users=users
      canUpdate=true
      learnerGroupTitle='this group'
      topLevelGroupTitle='top level group'
      sortBy='firstName'
      setSortBy=(action nothing)
      addUserToGroup=(action addOne)
      addUsersToGroup=(action nothing)
    }}`);

    await click(action);
  });

  test('when users are selected single action is disabled', async function(assert) {
    assert.expect(1);
    const user1CheckBox = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input[type=checkbox]';
    const action = 'tbody tr:nth-of-type(1) td:nth-of-type(6) .clickable';

    let user1 = EmberObject.create({
      enabled: true,
    });

    this.set('users', [user1]);
    this.set('nothing', () => {});

    await render(hbs`{{learnergroup-cohort-user-manager
      users=users
      canUpdate=true
      learnerGroupTitle='this group'
      topLevelGroupTitle='top level group'
      sortBy='firstName'
      setSortBy=(action nothing)
      addUserToGroup=(action nothing)
      addUsersToGroup=(action nothing)
    }}`);

    await click(user1CheckBox);
    assert.dom(action).doesNotExist();

  });

  test('checkall', async function(assert) {
    assert.expect(5);
    const checkAllBox = 'thead tr:nth-of-type(1) th:nth-of-type(1) input[type=checkbox]';
    const user1CheckBox = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input[type=checkbox]';
    const user2CheckBox = 'tbody tr:nth-of-type(2) td:nth-of-type(1) input[type=checkbox]';
    const button = 'button.done';

    let user1 = EmberObject.create({
      enabled: true,
    });
    let user2 = EmberObject.create({
      enabled: true,
    });

    this.set('users', [user1, user2]);
    this.set('nothing', () => {});
    this.set('addMany', ([userA, userB]) => {
      assert.equal(user1, userA);
      assert.equal(user2, userB);
    });

    await render(hbs`{{learnergroup-cohort-user-manager
      users=users
      canUpdate=true
      learnerGroupTitle='this group'
      topLevelGroupTitle='top level group'
      sortBy='firstName'
      setSortBy=(action nothing)
      addUserToGroup=(action nothing)
      addUsersToGroup=(action addMany)
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
    });
    let user2 = EmberObject.create({
      enabled: true,
    });

    this.set('users', [user1, user2]);
    this.set('nothing', () => {});

    await render(hbs`{{learnergroup-cohort-user-manager
      users=users
      canUpdate=true
      learnerGroupTitle='this group'
      topLevelGroupTitle='top level group'
      sortBy='firstName'
      setSortBy=(action nothing)
      addUserToGroup=(action nothing)
      addUsersToGroup=(action nothing)
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
    });

    this.set('users', [user1]);
    this.set('nothing', () => {});

    await render(hbs`{{learnergroup-cohort-user-manager
      users=users
      canUpdate=true
      learnerGroupTitle='this group'
      topLevelGroupTitle='top level group'
      sortBy='firstName'
      setSortBy=(action nothing)
      addUserToGroup=(action nothing)
      addUsersToGroup=(action nothing)
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
    });

    this.set('users', [user1]);
    this.set('nothing', () => {});

    await render(hbs`{{learnergroup-cohort-user-manager
      users=users
      canUpdate=true
      learnerGroupTitle='this group'
      topLevelGroupTitle='top level group'
      sortBy='firstName'
      setSortBy=(action nothing)
      addUserToGroup=(action nothing)
      addUsersToGroup=(action nothing)
    }}`);

    assert.equal(0, findAll(userCheckbox).length, 'Checkbox not visible');
    assert.equal(1, findAll(userDisabledIcon).length, 'User is labeled as disabled.');
  });
});
