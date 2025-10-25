import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { component } from 'ilios-common/page-objects/components/leadership-manager';
import LeadershipManager from 'ilios-common/components/leadership-manager';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | leadership-manager', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders with data', async function (assert) {
    this.server.createList('user', 2);
    const users = await this.owner.lookup('service:store').findAll('user');
    this.set('directors', [users[0]]);
    this.set('administrators', users);
    this.set('studentAdvisors', [users[1]]);

    await render(
      <template>
        <LeadershipManager
          @showAdministrators={{true}}
          @showDirectors={{true}}
          @showStudentAdvisors={{true}}
          @directors={{this.directors}}
          @administrators={{this.administrators}}
          @studentAdvisors={{this.studentAdvisors}}
          @removeDirector={{(noop)}}
          @addDirector={{(noop)}}
          @removeAdministrator={{(noop)}}
          @addAdministrator={{(noop)}}
          @removeStudentAdvisor={{(noop)}}
          @addStudentAdvisor={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.selectedDirectors.length, 1);
    assert.strictEqual(component.selectedDirectors[0].userNameInfo.fullName, '0 guy M. Mc0son');
    assert.strictEqual(component.selectedAdministrators.length, 2);
    assert.strictEqual(
      component.selectedAdministrators[0].userNameInfo.fullName,
      '0 guy M. Mc0son',
    );
    assert.strictEqual(
      component.selectedAdministrators[1].userNameInfo.fullName,
      '1 guy M. Mc1son',
    );
    assert.strictEqual(component.selectedStudentAdvisors.length, 1);
    assert.strictEqual(
      component.selectedStudentAdvisors[0].userNameInfo.fullName,
      '1 guy M. Mc1son',
    );
  });

  test('it renders without data', async function (assert) {
    this.set('directors', []);
    this.set('administrators', []);
    this.set('studentAdvisors', []);

    await render(
      <template>
        <LeadershipManager
          @showAdministrators={{true}}
          @showDirectors={{true}}
          @showStudentAdvisors={{true}}
          @directors={{this.directors}}
          @administrators={{this.administrators}}
          @studentAdvisors={{this.studentAdvisors}}
          @removeDirector={{(noop)}}
          @addDirector={{(noop)}}
          @removeAdministrator={{(noop)}}
          @addAdministrator={{(noop)}}
          @removeStudentAdvisor={{(noop)}}
          @addStudentAdvisor={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.selectedDirectors.length, 0);
    assert.strictEqual(component.selectedAdministrators.length, 0);
    assert.strictEqual(component.selectedStudentAdvisors.length, 0);
  });

  test('remove director', async function (assert) {
    this.server.createList('user', 1);
    const user = await this.owner.lookup('service:store').findRecord('user', 1);
    this.set('directors', [user]);
    this.set('administrators', []);
    this.set('studentAdvisors', []);
    this.set('remove', (who) => {
      assert.step('remove called');
      assert.strictEqual(who, user);
    });

    await render(
      <template>
        <LeadershipManager
          @showAdministrators={{true}}
          @showDirectors={{true}}
          @showStudentAdvisors={{true}}
          @directors={{this.directors}}
          @administrators={{this.administrators}}
          @studentAdvisors={{this.studentAdvisors}}
          @removeDirector={{this.remove}}
          @addDirector={{(noop)}}
          @removeAdministrator={{(noop)}}
          @addAdministrator={{(noop)}}
          @removeStudentAdvisor={{(noop)}}
          @addStudentAdvisor={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.selectedDirectors.length, 1);
    assert.strictEqual(component.selectedDirectors[0].userNameInfo.fullName, '0 guy M. Mc0son');
    await component.selectedDirectors[0].remove();
    assert.verifySteps(['remove called']);
  });

  test('remove administrator', async function (assert) {
    this.server.createList('user', 1);
    const user = await this.owner.lookup('service:store').findRecord('user', 1);
    this.set('directors', []);
    this.set('administrators', [user]);
    this.set('studentAdvisors', []);
    this.set('remove', (who) => {
      assert.step('remove called');
      assert.strictEqual(who, user);
    });

    await render(
      <template>
        <LeadershipManager
          @showAdministrators={{true}}
          @showDirectors={{true}}
          @showStudentAdvisors={{true}}
          @directors={{this.directors}}
          @administrators={{this.administrators}}
          @studentAdvisors={{this.studentAdvisors}}
          @removeDirector={{(noop)}}
          @addDirector={{(noop)}}
          @removeAdministrator={{this.remove}}
          @addAdministrator={{(noop)}}
          @removeStudentAdvisor={{(noop)}}
          @addStudentAdvisor={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.selectedAdministrators.length, 1);
    assert.strictEqual(
      component.selectedAdministrators[0].userNameInfo.fullName,
      '0 guy M. Mc0son',
    );
    await component.selectedAdministrators[0].remove();
    assert.verifySteps(['remove called']);
  });

  test('remove student advisor', async function (assert) {
    this.server.createList('user', 1);
    const user = await this.owner.lookup('service:store').findRecord('user', 1);
    this.set('directors', []);
    this.set('administrators', []);
    this.set('studentAdvisors', [user]);
    this.set('remove', (who) => {
      assert.step('remove called');
      assert.strictEqual(who, user);
    });

    await render(
      <template>
        <LeadershipManager
          @showAdministrators={{true}}
          @showDirectors={{true}}
          @showStudentAdvisors={{true}}
          @directors={{this.directors}}
          @administrators={{this.administrators}}
          @studentAdvisors={{this.studentAdvisors}}
          @removeDirector={{(noop)}}
          @addDirector={{(noop)}}
          @removeAdministrator={{(noop)}}
          @addAdministrator={{(noop)}}
          @removeStudentAdvisor={{this.remove}}
          @addStudentAdvisor={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.selectedStudentAdvisors.length, 1);
    assert.strictEqual(
      component.selectedStudentAdvisors[0].userNameInfo.fullName,
      '0 guy M. Mc0son',
    );
    await component.selectedStudentAdvisors[0].remove();
    assert.verifySteps(['remove called']);
  });

  test('add director', async function (assert) {
    this.server.createList('user', 1);
    const user = await this.owner.lookup('service:store').findRecord('user', 1);
    this.set('directors', []);
    this.set('administrators', [user]);
    this.set('studentAdvisors', [user]);
    this.set('add', (who) => {
      assert.step('add called');
      assert.strictEqual(who, user, 'user passed correctly from action');
      this.set('directors', [who]);
    });

    await render(
      <template>
        <LeadershipManager
          @showAdministrators={{true}}
          @showDirectors={{true}}
          @showStudentAdvisors={{true}}
          @directors={{this.directors}}
          @administrators={{this.administrators}}
          @studentAdvisors={{this.studentAdvisors}}
          @removeDirector={{(noop)}}
          @addDirector={{this.add}}
          @removeAdministrator={{(noop)}}
          @addAdministrator={{(noop)}}
          @removeStudentAdvisor={{(noop)}}
          @addStudentAdvisor={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.selectedDirectors.length, 0);
    assert.strictEqual(component.selectedAdministrators.length, 1);
    assert.strictEqual(component.selectedStudentAdvisors.length, 1);

    await component.directorSearch.search('0 guy');
    await component.directorSearch.results[0].add();

    assert.strictEqual(component.selectedDirectors.length, 1);
    assert.strictEqual(component.selectedAdministrators.length, 1);
    assert.strictEqual(component.selectedStudentAdvisors.length, 1);
    assert.strictEqual(component.selectedDirectors[0].userNameInfo.fullName, '0 guy M. Mc0son');
    assert.verifySteps(['add called']);
  });

  test('add administrator', async function (assert) {
    this.server.createList('user', 1);
    const user = await this.owner.lookup('service:store').findRecord('user', 1);
    this.set('directors', [user]);
    this.set('administrators', []);
    this.set('studentAdvisors', [user]);
    this.set('add', (who) => {
      assert.step('add called');
      assert.strictEqual(who, user, 'user passed correctly from action');
      this.set('administrators', [who]);
    });

    await render(
      <template>
        <LeadershipManager
          @showAdministrators={{true}}
          @showDirectors={{true}}
          @showStudentAdvisors={{true}}
          @directors={{this.directors}}
          @administrators={{this.administrators}}
          @studentAdvisors={{this.studentAdvisors}}
          @removeDirector={{(noop)}}
          @addDirector={{(noop)}}
          @removeAdministrator={{(noop)}}
          @addAdministrator={{this.add}}
          @removeStudentAdvisor={{(noop)}}
          @addStudentAdvisor={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.selectedDirectors.length, 1);
    assert.strictEqual(component.selectedAdministrators.length, 0);
    assert.strictEqual(component.selectedStudentAdvisors.length, 1);

    await component.administratorSearch.search('0 guy');
    await component.administratorSearch.results[0].add();

    assert.strictEqual(component.selectedDirectors.length, 1);
    assert.strictEqual(component.selectedAdministrators.length, 1);
    assert.strictEqual(component.selectedStudentAdvisors.length, 1);
    assert.strictEqual(
      component.selectedAdministrators[0].userNameInfo.fullName,
      '0 guy M. Mc0son',
    );
    assert.verifySteps(['add called']);
  });

  test('add student advisor', async function (assert) {
    this.server.createList('user', 1);
    const user = await this.owner.lookup('service:store').findRecord('user', 1);
    this.set('directors', [user]);
    this.set('administrators', [user]);
    this.set('studentAdvisors', []);
    this.set('add', (who) => {
      assert.step('add called');
      assert.strictEqual(who, user, 'user passed correctly from action');
      this.set('studentAdvisors', [who]);
    });

    await render(
      <template>
        <LeadershipManager
          @showAdministrators={{true}}
          @showDirectors={{true}}
          @showStudentAdvisors={{true}}
          @directors={{this.directors}}
          @administrators={{this.administrators}}
          @studentAdvisors={{this.studentAdvisors}}
          @removeDirector={{(noop)}}
          @addDirector={{(noop)}}
          @removeAdministrator={{(noop)}}
          @addAdministrator={{(noop)}}
          @removeStudentAdvisor={{(noop)}}
          @addStudentAdvisor={{this.add}}
        />
      </template>,
    );
    assert.strictEqual(component.selectedDirectors.length, 1);
    assert.strictEqual(component.selectedAdministrators.length, 1);
    assert.strictEqual(component.selectedStudentAdvisors.length, 0);

    await component.studentAdvisorSearch.search('0 guy');
    await component.studentAdvisorSearch.results[0].add();

    assert.strictEqual(component.selectedDirectors.length, 1);
    assert.strictEqual(component.selectedAdministrators.length, 1);
    assert.strictEqual(component.selectedStudentAdvisors.length, 1);
    assert.strictEqual(
      component.selectedStudentAdvisors[0].userNameInfo.fullName,
      '0 guy M. Mc0son',
    );
    assert.verifySteps(['add called']);
  });

  test('disabled user accounts are indicated with an icon', async function (assert) {
    this.server.create('user', {
      enabled: true,
    });
    this.server.create('user', {
      enabled: false,
    });
    const users = await this.owner.lookup('service:store').findAll('user');

    this.set('directors', [users[0]]);
    this.set('administrators', users);

    await render(
      <template>
        <LeadershipManager
          @showAdministrators={{true}}
          @showDirectors={{true}}
          @directors={{this.directors}}
          @administrators={{this.administrators}}
          @removeDirector={{(noop)}}
          @addDirector={{(noop)}}
          @removeAdministrator={{(noop)}}
          @addAdministrator={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.selectedDirectors.length, 1);
    assert.strictEqual(component.selectedDirectors[0].userNameInfo.fullName, '0 guy M. Mc0son');
    assert.notOk(component.selectedDirectors[0].userStatus.accountIsDisabled);
    assert.strictEqual(component.selectedAdministrators.length, 2);
    assert.strictEqual(
      component.selectedAdministrators[0].userNameInfo.fullName,
      '0 guy M. Mc0son',
    );
    assert.notOk(component.selectedAdministrators[0].userStatus.accountIsDisabled);
    assert.strictEqual(
      component.selectedAdministrators[1].userNameInfo.fullName,
      '1 guy M. Mc1son',
    );
    assert.ok(component.selectedAdministrators[1].userStatus.accountIsDisabled);
  });

  test('users are sorted by full name', async function (assert) {
    this.server.create('user', { firstName: 'Aaron', lastName: 'Aardvark' });
    this.server.create('user', {
      firstName: 'Ursula',
      middleName: 'Undine',
      lastName: 'Unbekannt',
    });
    this.server.create('user', {
      firstName: 'Zeb',
      lastName: 'Zoober',
      displayName: 'The Bane of Iowa',
    });
    const users = await this.owner.lookup('service:store').findAll('user');

    this.set('directors', users);
    this.set('administrators', users);
    this.set('studentAdvisors', users);

    await render(
      <template>
        <LeadershipManager
          @showAdministrators={{true}}
          @showDirectors={{true}}
          @showStudentAdvisors={{true}}
          @directors={{this.directors}}
          @administrators={{this.administrators}}
          @studentAdvisors={{this.studentAdvisors}}
          @removeDirector={{(noop)}}
          @addDirector={{(noop)}}
          @removeAdministrator={{(noop)}}
          @addAdministrator={{(noop)}}
          @removeStudentAdvisor={{(noop)}}
          @addStudentAdvisor={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.selectedDirectors.length, 3);
    assert.strictEqual(component.selectedDirectors[0].userNameInfo.fullName, 'Aaron M. Aardvark');
    assert.strictEqual(component.selectedDirectors[1].userNameInfo.fullName, 'The Bane of Iowa');
    assert.strictEqual(component.selectedDirectors[2].userNameInfo.fullName, 'Ursula U. Unbekannt');
    assert.strictEqual(component.selectedAdministrators.length, 3);
    assert.strictEqual(
      component.selectedAdministrators[0].userNameInfo.fullName,
      'Aaron M. Aardvark',
    );
    assert.strictEqual(
      component.selectedAdministrators[1].userNameInfo.fullName,
      'The Bane of Iowa',
    );
    assert.strictEqual(
      component.selectedAdministrators[2].userNameInfo.fullName,
      'Ursula U. Unbekannt',
    );
    assert.strictEqual(component.selectedStudentAdvisors.length, 3);
    assert.strictEqual(
      component.selectedStudentAdvisors[0].userNameInfo.fullName,
      'Aaron M. Aardvark',
    );
    assert.strictEqual(
      component.selectedStudentAdvisors[1].userNameInfo.fullName,
      'The Bane of Iowa',
    );
    assert.strictEqual(
      component.selectedStudentAdvisors[2].userNameInfo.fullName,
      'Ursula U. Unbekannt',
    );
  });

  test('username info tooltip shows as applicable', async function (assert) {
    this.server.create('user', { firstName: 'Aaron', lastName: 'Aardvark' });
    this.server.create('user', {
      firstName: 'Ursula',
      middleName: 'Undine',
      lastName: 'Unbekannt',
    });
    this.server.create('user', {
      firstName: 'Zeb',
      lastName: 'Zoober',
      displayName: 'The Bane of Iowa',
    });
    const users = await this.owner.lookup('service:store').findAll('user');

    this.set('directors', users);
    this.set('administrators', users);
    this.set('studentAdvisors', users);

    await render(
      <template>
        <LeadershipManager
          @showAdministrators={{true}}
          @showDirectors={{true}}
          @showStudentAdvisors={{true}}
          @directors={{this.directors}}
          @administrators={{this.administrators}}
          @studentAdvisors={{this.studentAdvisors}}
          @removeDirector={{(noop)}}
          @addDirector={{(noop)}}
          @removeAdministrator={{(noop)}}
          @addAdministrator={{(noop)}}
          @removeStudentAdvisor={{(noop)}}
          @addStudentAdvisor={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.selectedDirectors.length, 3);
    assert.strictEqual(component.selectedDirectors[0].userNameInfo.fullName, 'Aaron M. Aardvark');
    assert.strictEqual(component.selectedDirectors[1].userNameInfo.fullName, 'The Bane of Iowa');
    assert.strictEqual(component.selectedDirectors[2].userNameInfo.fullName, 'Ursula U. Unbekannt');
    assert.notOk(component.selectedDirectors[0].userNameInfo.hasAdditionalInfo);
    assert.ok(component.selectedDirectors[1].userNameInfo.hasAdditionalInfo);
    assert.notOk(component.selectedDirectors[2].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(component.selectedAdministrators.length, 3);
    assert.strictEqual(
      component.selectedAdministrators[0].userNameInfo.fullName,
      'Aaron M. Aardvark',
    );
    assert.strictEqual(
      component.selectedAdministrators[1].userNameInfo.fullName,
      'The Bane of Iowa',
    );
    assert.strictEqual(
      component.selectedAdministrators[2].userNameInfo.fullName,
      'Ursula U. Unbekannt',
    );
    assert.notOk(component.selectedAdministrators[0].userNameInfo.hasAdditionalInfo);
    assert.ok(component.selectedAdministrators[1].userNameInfo.hasAdditionalInfo);
    assert.notOk(component.selectedAdministrators[2].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(component.selectedStudentAdvisors.length, 3);
    assert.strictEqual(
      component.selectedStudentAdvisors[0].userNameInfo.fullName,
      'Aaron M. Aardvark',
    );
    assert.strictEqual(
      component.selectedStudentAdvisors[1].userNameInfo.fullName,
      'The Bane of Iowa',
    );
    assert.strictEqual(
      component.selectedStudentAdvisors[2].userNameInfo.fullName,
      'Ursula U. Unbekannt',
    );
    assert.notOk(component.selectedStudentAdvisors[0].userNameInfo.hasAdditionalInfo);
    assert.ok(component.selectedStudentAdvisors[1].userNameInfo.hasAdditionalInfo);
    assert.notOk(component.selectedStudentAdvisors[2].userNameInfo.hasAdditionalInfo);
  });
});
