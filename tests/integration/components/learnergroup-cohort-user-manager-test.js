import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/learnergroup-cohort-user-manager';

module('Integration | Component | learnergroup cohort user manager', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
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

    this.set('users', [userModel1, userModel2]);

    await render(hbs`<LearnergroupCohortUserManager
      @users={{this.users}}
      @canUpdate={{true}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top level group"
      @sortBy="lastName"
      @setSortBy={{(noop)}}
      @addUserToGroup={{(noop)}}
      @addUsersToGroup={{(noop)}}
    />`);

    assert.equal(component.title, 'Cohort Members NOT assigned to top level group (2)');
    assert.equal(component.users.length, 2);
    assert.equal(component.users[0].name.userNameInfo.fullName, 'Jasper M. Dog');
    assert.equal(component.users[0].campusId, '1234');
    assert.equal(component.users[0].email, 'testemail');
    assert.notOk(component.users[0].isDisabled);
    assert.equal(component.users[1].name.userNameInfo.fullName, 'Jackson M. Doggy');
    assert.equal(component.users[1].campusId, '123');
    assert.equal(component.users[1].email, 'testemail2');
    assert.ok(component.users[1].isDisabled);
  });

  test('sort by full name', async function (assert) {
    const user1 = this.server.create('user', { firstName: 'Jasper' });
    const user2 = this.server.create('user', { firstName: 'Jackson' });
    const user3 = this.server.create('user', { firstName: 'Jayden', displayName: 'Captain J' });
    const userModel1 = await this.owner.lookup('service:store').find('user', user1.id);
    const userModel2 = await this.owner.lookup('service:store').find('user', user2.id);
    const userModel3 = await this.owner.lookup('service:store').find('user', user3.id);

    this.set('users', [userModel1, userModel2, userModel3]);

    await render(hbs`<LearnergroupCohortUserManager
      @users={{this.users}}
      @canUpdate={{true}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top level group"
      @sortBy="fullName"
      @setSortBy={{(noop)}}
      @addUserToGroup={{(noop)}}
      @addUsersToGroup={{(noop)}}
    />`);

    assert.equal(component.users.length, 3);
    assert.equal(component.users[0].name.userNameInfo.fullName, 'Captain J');
    assert.equal(component.users[1].name.userNameInfo.fullName, 'Jackson M. Mc1son');
    assert.equal(component.users[2].name.userNameInfo.fullName, 'Jasper M. Mc0son');
  });

  test('add multiple users', async function (assert) {
    assert.expect(5);

    const user = this.server.create('user', { enabled: true });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);

    this.set('users', [userModel]);
    this.set('addMany', ([user]) => {
      assert.equal(userModel, user);
    });

    await render(hbs`<LearnergroupCohortUserManager
      @users={{this.users}}
      @canUpdate={{true}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top level group"
      @sortBy="firstName"
      @setSortBy={{(noop)}}
      @addUserToGroup={{(noop)}}
      @addUsersToGroup={{this.addMany}}
    />`);

    assert.notOk(component.membersCanBeAdded);
    await component.users[0].select();
    assert.ok(component.membersCanBeAdded);
    assert.equal(component.addButtonText, 'Move learner to this group');
    await component.add();
    assert.notOk(component.membersCanBeAdded);
  });

  test('add single user', async function (assert) {
    assert.expect(1);

    const user = this.server.create('user', { enabled: true });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);

    this.set('users', [userModel]);
    this.set('addOne', (user) => {
      assert.equal(userModel, user);
    });

    await render(hbs`<LearnergroupCohortUserManager
      @users={{this.users}}
      @canUpdate={{true}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top level group"
      @sortBy="firstName"
      @setSortBy={{(noop)}}
      @addUserToGroup={{this.addOne}}
      @addUsersToGroup={{(noop)}}
    />`);

    await component.users[0].add();
  });

  test('when users are selected single action is disabled', async function (assert) {
    assert.expect(2);

    const user = this.server.create('user', { enabled: true });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);

    this.set('users', [userModel]);

    await render(hbs`<LearnergroupCohortUserManager
      @users={{this.users}}
      @canUpdate={{true}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top level group"
      @sortBy="firstName"
      @setSortBy={{(noop)}}
      @addUserToGroup={{(noop)}}
      @addUsersToGroup={{(noop)}}
    />`);

    assert.ok(component.users[0].canBeAdded);
    await component.users[0].select();
    assert.notOk(component.users[0].canBeAdded);
  });

  test('checkall', async function (assert) {
    assert.expect(7);

    const user1 = this.server.create('user', { firstName: 'Jasper' });
    const user2 = this.server.create('user', { firstName: 'Jackson' });
    const userModel1 = await this.owner.lookup('service:store').find('user', user1.id);
    const userModel2 = await this.owner.lookup('service:store').find('user', user2.id);

    this.set('users', [userModel1, userModel2]);
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
      @setSortBy={{(noop)}}
      @addUserToGroup={{(noop)}}
      @addUsersToGroup={{this.addMany}}
    />`);

    assert.notOk(component.users[0].isSelected);
    assert.notOk(component.users[0].isSelected);
    await component.selectAll.toggle();
    assert.ok(component.users[0].isSelected);
    assert.ok(component.users[0].isSelected);
    assert.equal(component.addButtonText, 'Move 2 learners to this group');
    await component.add();
  });

  test('checking one puts checkall box into indeterminate state', async function (assert) {
    const user1 = this.server.create('user', { enabled: true });
    const user2 = this.server.create('user', { enabled: true });
    const userModel1 = await this.owner.lookup('service:store').find('user', user1.id);
    const userModel2 = await this.owner.lookup('service:store').find('user', user2.id);

    this.set('users', [userModel1, userModel2]);

    await render(hbs`<LearnergroupCohortUserManager
      @users={{this.users}}
      @canUpdate={{true}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top level group"
      @sortBy="firstName"
      @setSortBy={{(noop)}}
      @addUserToGroup={{(noop)}}
      @addUsersToGroup={{(noop)}}
    />`);

    assert.notOk(component.users[0].isSelected);
    assert.notOk(component.users[1].isSelected);
    assert.notOk(component.selectAll.isChecked);
    assert.notOk(component.selectAll.isIndeterminate);
    await component.users[0].select();
    assert.notOk(component.selectAll.isChecked);
    assert.ok(component.selectAll.isIndeterminate);
    await component.users[1].select();
    assert.ok(component.selectAll.isChecked);
    assert.notOk(component.selectAll.isIndeterminate);
    assert.ok(component.users[0].isSelected);
    assert.ok(component.users[1].isSelected);
    await component.selectAll.toggle();
    assert.notOk(component.users[0].isSelected);
    assert.notOk(component.users[1].isSelected);
  });

  test('filtering and bulk-selection', async function (assert) {
    const user1 = this.server.create('user', { enabled: true, displayName: 'Alpha' });
    const user2 = this.server.create('user', { enabled: true, displayName: 'Beta' });
    const user3 = this.server.create('user', { enabled: true, displayName: 'Gamma' });
    const userModel1 = await this.owner.lookup('service:store').find('user', user1.id);
    const userModel2 = await this.owner.lookup('service:store').find('user', user2.id);
    const userModel3 = await this.owner.lookup('service:store').find('user', user3.id);

    this.set('users', [userModel1, userModel2, userModel3]);

    await render(hbs`<LearnergroupCohortUserManager
      @users={{this.users}}
      @canUpdate={{true}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top level group"
      @sortBy="firstName"
      @setSortBy={{(noop)}}
      @addUserToGroup={{(noop)}}
      @addUsersToGroup={{(noop)}}
    />`);

    assert.equal(component.users.length, 3);
    assert.equal(component.users[0].name.userNameInfo.fullName, 'Alpha');
    assert.equal(component.users[1].name.userNameInfo.fullName, 'Beta');
    assert.equal(component.users[2].name.userNameInfo.fullName, 'Gamma');
    assert.notOk(component.users[0].isSelected);
    assert.notOk(component.users[1].isSelected);
    assert.notOk(component.users[2].isSelected);
    assert.notOk(component.selectAll.isChecked);
    assert.notOk(component.selectAll.isIndeterminate);

    await component.filter('Zzzz');
    assert.equal(component.users.length, 0);
    assert.notOk(component.selectAll.isChecked);
    assert.notOk(component.selectAll.isIndeterminate);

    await component.filter('');
    assert.equal(component.users.length, 3);
    assert.notOk(component.selectAll.isChecked);
    assert.notOk(component.selectAll.isIndeterminate);

    await component.users[2].select();
    assert.notOk(component.selectAll.isChecked);
    assert.ok(component.selectAll.isIndeterminate);

    await component.filter('Alpha');
    assert.notOk(component.selectAll.isChecked);
    assert.ok(component.selectAll.isIndeterminate);
    assert.equal(component.users.length, 1);
    assert.equal(component.users[0].name.userNameInfo.fullName, 'Alpha');
    assert.notOk(component.users[0].isSelected);

    await component.selectAll.toggle();
    assert.ok(component.selectAll.isChecked);
    assert.ok(component.selectAll.isIndeterminate);
    assert.ok(component.users[0].isSelected);

    await component.filter('');
    assert.equal(component.users.length, 3);
    assert.ok(component.selectAll.isChecked);
    assert.ok(component.selectAll.isIndeterminate);
    assert.ok(component.users[0].isSelected);
    assert.notOk(component.users[1].isSelected);
    assert.ok(component.users[2].isSelected);

    await component.selectAll.toggle();
    assert.ok(component.selectAll.isChecked);
    assert.notOk(component.selectAll.isIndeterminate);
    assert.ok(component.users[0].isSelected);
    assert.ok(component.users[1].isSelected);
    assert.ok(component.users[2].isSelected);

    await component.selectAll.toggle();
    assert.notOk(component.selectAll.isChecked);
    assert.notOk(component.selectAll.isIndeterminate);
    assert.notOk(component.users[0].isSelected);
    assert.notOk(component.users[1].isSelected);
    assert.notOk(component.users[2].isSelected);
  });

  test('root users can manage disabled users', async function (assert) {
    assert.expect(2);

    const currentUserMock = Service.extend({
      isRoot: true,
    });
    this.owner.register('service:currentUser', currentUserMock);

    const user = this.server.create('user', { enabled: false });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);

    this.set('users', [userModel]);
    await render(hbs`<LearnergroupCohortUserManager
      @users={{this.users}}
      @canUpdate={{true}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top level group"
      @sortBy="firstName"
      @setSortBy={{(noop)}}
      @addUserToGroup={{(noop)}}
      @addUsersToGroup={{(noop)}}
    />`);

    assert.ok(component.users[0].canBeSelected, 'Checkbox visible');
    assert.ok(component.users[0].isDisabled, 'User is labeled as disabled.');
  });

  test('non-root users cannot manage disabled users', async function (assert) {
    assert.expect(2);

    const currentUserMock = Service.extend({
      isRoot: false,
    });
    this.owner.register('service:currentUser', currentUserMock);

    const user = this.server.create('user', { enabled: false });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);

    this.set('users', [userModel]);

    await render(hbs`<LearnergroupCohortUserManager
      @users={{this.users}}
      @canUpdate={{true}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top level group"
      @sortBy="firstName"
      @setSortBy={{(noop)}}
      @addUserToGroup={{(noop)}}
      @addUsersToGroup={{(noop)}}
    />`);

    assert.notOk(component.users[0].canBeSelected, 'Checkbox visible');
    assert.ok(component.users[0].isDisabled, 'User is labeled as disabled.');
  });

  test('filter users', async function (assert) {
    const user1 = this.server.create('user', {
      firstName: 'Jasper',
      lastName: 'Dog',
      email: 'jasper.dog@example.edu',
    });
    const user2 = this.server.create('user', {
      firstName: 'Jackson',
      lastName: 'Doggy',
      email: 'jackson.doggy@example.edu',
    });
    const user3 = this.server.create('user', {
      firstName: 'Jayden',
      lastName: 'Pup',
      displayName: 'Just Jayden',
      email: 'jayden@example.edu',
    });
    const userModel1 = await this.owner.lookup('service:store').find('user', user1.id);
    const userModel2 = await this.owner.lookup('service:store').find('user', user2.id);
    const userModel3 = await this.owner.lookup('service:store').find('user', user3.id);

    this.set('users', [userModel1, userModel2, userModel3]);
    await render(hbs`<LearnergroupCohortUserManager
      @users={{this.users}}
      @canUpdate={{true}}
      @learnerGroupTitle="this group"
      @topLevelGroupTitle="top level group"
      @sortBy="lastName"
      @setSortBy={{(noop)}}
      @addUserToGroup={{(noop)}}
      @addUsersToGroup={{(noop)}}
    />`);

    assert.equal(component.users.length, 3);
    assert.equal(component.users[0].name.userNameInfo.fullName, 'Jasper M. Dog');
    assert.equal(component.users[1].name.userNameInfo.fullName, 'Jackson M. Doggy');
    assert.equal(component.users[2].name.userNameInfo.fullName, 'Just Jayden');
    await component.filter('Just');
    assert.equal(component.users[0].name.userNameInfo.fullName, 'Just Jayden');
    await component.filter(' Just     ');
    assert.equal(component.users[0].name.userNameInfo.fullName, 'Just Jayden');
    await component.filter('JASPER.DOG@EXAMPLE.EDU');
    assert.equal(component.users[0].name.userNameInfo.fullName, 'Jasper M. Dog');
    await component.filter('jasper d');
    assert.equal(component.users[0].name.userNameInfo.fullName, 'Jasper M. Dog');
  });
});
