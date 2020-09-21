import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click, findAll, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | learnergroup cohort user manager', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    const userList = 'tbody tr';
    const user1CheckBox = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input[type=checkbox]';
    const user1FullName = 'tbody tr:nth-of-type(1) td:nth-of-type(2)';
    const user1CampusId = 'tbody tr:nth-of-type(1) td:nth-of-type(3)';
    const user1Email = 'tbody tr:nth-of-type(1) td:nth-of-type(4)';
    const user2Disabled = 'tbody tr:nth-of-type(2) td:nth-of-type(1) svg';
    const user2FullName = 'tbody tr:nth-of-type(2) td:nth-of-type(2)';
    const user2CampusId = 'tbody tr:nth-of-type(2) td:nth-of-type(3)';
    const user2Email = 'tbody tr:nth-of-type(2) td:nth-of-type(4)';

    const user1 = this.server.create('user', {
      firstName: 'Jasper',
      lastName: 'Dog',
      campusId: '1234',
      email: 'testemail',
      enabled: true,
    });
    const user2 = this.server.create('user', {
      firstName: 'Jackson',
      lastName: 'Doggy',
      campusId: '123',
      email: 'testemail2',
      enabled: false,
    });
    const userModel1 = await this.owner.lookup('service:store').find('user', user1.id);
    const userModel2 = await this.owner.lookup('service:store').find('user', user2.id);

    this.set('users', [ userModel1, userModel2] );

    await render(hbs`<LearnergroupCohortUserManager
      @users={{this.users}}
      @canUpdate={{true}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top level group"
      @sortBy="lastName"
      @setSortBy={{noop}}
      @addUserToGroup={{noop}}
      @addUsersToGroup={{noop}}
    />`);

    assert.dom('.title').hasText('Cohort Members NOT assigned to top level group (2)');
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
    const user1FullName = 'tbody tr:nth-of-type(1) td:nth-of-type(2) [data-test-fullname]';
    const user1AdditionalNameInfo = 'tbody tr:nth-of-type(1) td:nth-of-type(2) [data-test-info]';
    const user2FullName = 'tbody tr:nth-of-type(2) td:nth-of-type(2) [data-test-fullname]';
    const user2AdditionalNameInfo = 'tbody tr:nth-of-type(2) td:nth-of-type(2) [data-test-info]';
    const user3FullName = 'tbody tr:nth-of-type(3) td:nth-of-type(2) [data-test-fullname]';
    const user3AdditionalNameInfo = 'tbody tr:nth-of-type(3) td:nth-of-type(2) [data-test-info]';

    const user1 = this.server.create('user', { firstName: 'Jasper' });
    const user2 = this.server.create('user', { firstName: 'Jackson' });
    const user3 = this.server.create('user', { firstName: 'Jayden', displayName: 'Captain J' });
    const userModel1 = await this.owner.lookup('service:store').find('user', user1.id);
    const userModel2 = await this.owner.lookup('service:store').find('user', user2.id);
    const userModel3 = await this.owner.lookup('service:store').find('user', user3.id);

    this.set('users', [ userModel1, userModel2, userModel3 ]);

    await render(hbs`<LearnergroupCohortUserManager
      @users={{this.users}}
      @canUpdate={{true}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top level group"
      @sortBy="fullName"
      @setSortBy={{noop}}
      @addUserToGroup={{noop}}
      @addUsersToGroup={{noop}}
    />`);

    assert.dom(userList).exists({ count: 3 });
    assert.dom(user1FullName).hasText('Captain J');
    assert.dom(user1AdditionalNameInfo).exists();
    assert.dom(user2FullName).hasText('Jackson M. Mc1son');
    assert.dom(user2AdditionalNameInfo).doesNotExist();
    assert.dom(user3FullName).hasText('Jasper M. Mc0son');
    assert.dom(user3AdditionalNameInfo).doesNotExist();
  });

  test('add multiple users', async function(assert) {
    assert.expect(4);
    const user1CheckBox = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input[type=checkbox]';
    const button = 'button.done';

    const user = this.server.create('user', { enabled: true });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);

    this.set('users', [ userModel ]);
    this.set('addMany', ([ user ]) => {
      assert.equal(userModel, user);
    });

    await render(hbs`<LearnergroupCohortUserManager
      @users={{this.users}}
      @canUpdate={{true}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top level group"
      @sortBy="firstName"
      @setSortBy={{noop}}
      @addUserToGroup={{noop}}
      @addUsersToGroup={{this.addMany}}
    />`);

    assert.dom(button).doesNotExist();
    await click(user1CheckBox);
    assert.dom(button).hasText('Move learner to this group');
    await click(button);
    await settled();
    assert.dom(button).doesNotExist('button is hidden after save');
  });

  test('add single user', async function(assert) {
    assert.expect(1);
    const action = 'tbody tr:nth-of-type(1) td:nth-of-type(5) .clickable';

    const user = this.server.create('user', { enabled: true });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);

    this.set('users', [ userModel ]);
    this.set('addOne', user => {
      assert.equal(userModel, user);
    });

    await render(hbs`<LearnergroupCohortUserManager
      @users={{this.users}}
      @canUpdate={{true}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top level group"
      @sortBy="firstName"
      @setSortBy={{noop}}
      @addUserToGroup={{this.addOne}}
      @addUsersToGroup={{noop}}
    />`);

    await click(action);
  });

  test('when users are selected single action is disabled', async function(assert) {
    assert.expect(1);
    const user1CheckBox = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input[type=checkbox]';
    const action = 'tbody tr:nth-of-type(1) td:nth-of-type(5) .clickable';

    const user = this.server.create('user', { enabled: true });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);

    this.set('users', [ userModel ]);

    await render(hbs`<LearnergroupCohortUserManager
      @users={{this.users}}
      @canUpdate={{true}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top level group"
      @sortBy="firstName"
      @setSortBy={{noop}}
      @addUserToGroup={{noop}}
      @addUsersToGroup={{noop}}
    />`);

    await click(user1CheckBox);
    assert.dom(action).doesNotExist();

  });

  test('checkall', async function(assert) {
    assert.expect(5);
    const checkAllBox = 'thead tr:nth-of-type(1) th:nth-of-type(1) input[type=checkbox]';
    const user1CheckBox = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input[type=checkbox]';
    const user2CheckBox = 'tbody tr:nth-of-type(2) td:nth-of-type(1) input[type=checkbox]';
    const button = 'button.done';

    const user1 = this.server.create('user', { firstName: 'Jasper' });
    const user2 = this.server.create('user', { firstName: 'Jackson' });
    const userModel1 = await this.owner.lookup('service:store').find('user', user1.id);
    const userModel2 = await this.owner.lookup('service:store').find('user', user2.id);

    this.set('users', [ userModel1, userModel2 ]);
    this.set('addMany', ([userA, userB]) => {
      assert.equal(userModel1, userA);
      assert.equal(userModel2, userB);
    });

    await render(hbs`<LearnergroupCohortUserManager
      @users={{this.users}}
      @canUpdate={{true}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top level group"
      @sortBy="firstName"
      @setSortBy={{noop}}
      @addUserToGroup={{noop}}
      @addUsersToGroup={{this.addMany}}
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

    const user1 = this.server.create('user', { enabled: true });
    const user2 = this.server.create('user', { enabled: true });
    const userModel1 = await this.owner.lookup('service:store').find('user', user1.id);
    const userModel2 = await this.owner.lookup('service:store').find('user', user2.id);

    this.set('users', [ userModel1, userModel2 ]);

    await render(hbs`<LearnergroupCohortUserManager
      @users={{this.users}}
      @canUpdate={{true}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top level group"
      @sortBy="firstName"
      @setSortBy={{noop}}
      @addUserToGroup={{noop}}
      @addUsersToGroup={{noop}}
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

    const user = this.server.create('user', { enabled: false });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);

    this.set('users', [ userModel ]);
    await render(hbs`<LearnergroupCohortUserManager
      @users={{this.users}}
      @canUpdate={{true}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top level group"
      @sortBy="firstName"
      @setSortBy={{noop}}
      @addUserToGroup={{noop}}
      @addUsersToGroup={{noop}}
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


    const user = this.server.create('user', { enabled: false });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);

    this.set('users', [ userModel ]);

    await render(hbs`<LearnergroupCohortUserManager
      @users={{this.users}}
      @canUpdate={{true}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top level group"
      @sortBy="firstName"
      @setSortBy={{noop}}
      @addUserToGroup={{noop}}
      @addUsersToGroup={{noop}}
    />`);

    assert.equal(0, findAll(userCheckbox).length, 'Checkbox not visible');
    assert.equal(1, findAll(userDisabledIcon).length, 'User is labeled as disabled.');
  });
});
