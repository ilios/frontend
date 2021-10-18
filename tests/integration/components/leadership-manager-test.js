import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn, click, findAll, find, triggerEvent } from '@ember/test-helpers';
import { map } from 'rsvp';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | leadership manager', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders with data', async function (assert) {
    assert.expect(7);
    this.server.createList('user', 2);
    const users = await this.owner.lookup('service:store').findAll('user');
    this.set('directors', [users.firstObject]);
    this.set('administrators', users);
    this.set('studentAdvisors', [users.objectAt(1)]);

    await render(hbs`<LeadershipManager
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
    />`);
    const directors = 'table tbody tr:nth-of-type(1) td:nth-of-type(1) li';
    const administrators = 'table tbody tr:nth-of-type(1) td:nth-of-type(2) li';
    const studentAdvisors = 'table tbody tr:nth-of-type(1) td:nth-of-type(3) li';

    assert.dom(directors).exists({ count: 1 });
    assert.dom(findAll(directors)[0]).hasText('0 guy M. Mc0son');
    assert.dom(administrators).exists({ count: 2 });
    assert.dom(findAll(administrators)[0]).hasText('0 guy M. Mc0son');
    assert.dom(findAll(administrators)[1]).hasText('1 guy M. Mc1son');
    assert.dom(studentAdvisors).exists({ count: 1 });
    assert.dom(findAll(studentAdvisors)[0]).hasText('1 guy M. Mc1son');
  });

  test('it renders without data', async function (assert) {
    assert.expect(3);
    this.set('directors', []);
    this.set('administrators', []);
    this.set('studentAdvisors', []);

    await render(hbs`<LeadershipManager
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
    />`);
    const directors = 'table tbody tr:nth-of-type(1) td:nth-of-type(1) li';
    const administrators = 'table tbody tr:nth-of-type(1) td:nth-of-type(2) li';
    const studentAdvisors = 'table tbody tr:nth-of-type(1) td:nth-of-type(3) li';

    assert.dom(directors).doesNotExist();
    assert.dom(administrators).doesNotExist();
    assert.dom(studentAdvisors).doesNotExist();
  });

  test('remove director', async function (assert) {
    assert.expect(3);
    this.server.createList('user', 1);
    const user = await this.owner.lookup('service:store').find('user', 1);
    this.set('directors', [user]);
    this.set('administrators', []);
    this.set('studentAdvisors', []);
    this.set('remove', (who) => {
      assert.equal(who, user);
    });

    await render(hbs`<LeadershipManager
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
    />`);
    const list = 'table tbody tr:nth-of-type(1) td:nth-of-type(1) li';
    const icon = `${list}:nth-of-type(1) svg`;

    assert.dom(list).exists({ count: 1 });
    assert.dom(findAll(list)[0]).hasText('0 guy M. Mc0son');
    await click(icon);
  });

  test('remove administrator', async function (assert) {
    assert.expect(3);
    this.server.createList('user', 1);
    const user = await this.owner.lookup('service:store').find('user', 1);
    this.set('directors', []);
    this.set('administrators', [user]);
    this.set('studentAdvisors', []);
    this.set('remove', (who) => {
      assert.equal(who, user);
    });

    await render(hbs`<LeadershipManager
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
    />`);
    const list = 'table tbody tr:nth-of-type(1) td:nth-of-type(2) li';
    const icon = `${list}:nth-of-type(1) svg`;

    assert.dom(list).exists({ count: 1 });
    assert.dom(findAll(list)[0]).hasText('0 guy M. Mc0son');
    await click(icon);
  });

  test('remove student advisor', async function (assert) {
    assert.expect(3);
    this.server.createList('user', 1);
    const user = await this.owner.lookup('service:store').find('user', 1);
    this.set('directors', []);
    this.set('administrators', []);
    this.set('studentAdvisors', [user]);
    this.set('remove', (who) => {
      assert.equal(who, user);
    });

    await render(hbs`<LeadershipManager
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
    />`);
    const list = 'table tbody tr:nth-of-type(1) td:nth-of-type(3) li';
    const icon = `${list}:nth-of-type(1) svg`;

    assert.dom(list).exists({ count: 1 });
    assert.dom(findAll(list)[0]).hasText('0 guy M. Mc0son');
    await click(icon);
  });

  test('add director', async function (assert) {
    assert.expect(8);
    this.server.createList('user', 1);
    const user = await this.owner.lookup('service:store').find('user', 1);
    this.set('directors', []);
    this.set('administrators', [user]);
    this.set('studentAdvisors', [user]);
    this.set('add', (who) => {
      assert.equal(who, user, 'user passed correctly from action');
      this.set('directors', [who]);
    });

    await render(hbs`<LeadershipManager
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
    />`);
    const directorsList = 'table tbody tr:nth-of-type(1) td:nth-of-type(1) li';
    const administratorsList = 'table tbody tr:nth-of-type(1) td:nth-of-type(2) li';
    const studentAdvisorsList = 'table tbody tr:nth-of-type(1) td:nth-of-type(3) li';
    const directorSearch = '[data-test-director-search] input';
    const firstResult = '[data-test-result-index="1"]';

    assert.dom(directorsList).doesNotExist();
    assert.dom(administratorsList).exists({ count: 1 });
    assert.dom(studentAdvisorsList).exists({ count: 1 });
    await fillIn(directorSearch, 'user');

    assert.ok(find(firstResult).textContent.includes('0 guy'));
    await click(firstResult);
    assert.dom(directorsList).exists({ count: 1 });
    assert.dom(administratorsList).exists({ count: 1 });
    assert.dom(studentAdvisorsList).exists({ count: 1 });
  });

  test('add administrator', async function (assert) {
    assert.expect(8);
    this.server.createList('user', 1);
    const user = await this.owner.lookup('service:store').find('user', 1);
    this.set('directors', [user]);
    this.set('administrators', []);
    this.set('studentAdvisors', [user]);
    this.set('add', (who) => {
      assert.equal(who, user, 'user passed correctly from action');
      this.set('administrators', [who]);
    });

    await render(hbs`<LeadershipManager
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
    />`);
    const directorsList = 'table tbody tr:nth-of-type(1) td:nth-of-type(1) li';
    const administratorsList = 'table tbody tr:nth-of-type(1) td:nth-of-type(2) li';
    const studentAdvisorsList = 'table tbody tr:nth-of-type(1) td:nth-of-type(3) li';
    const administratorSearch = '[data-test-administrator-search] input';
    const firstResult = '[data-test-result-index="1"]';

    assert.dom(directorsList).exists({ count: 1 });
    assert.dom(administratorsList).doesNotExist();
    assert.dom(studentAdvisorsList).exists({ count: 1 });

    await fillIn(administratorSearch, 'user');

    assert.ok(find(firstResult).textContent.includes('0 guy'));
    await click(firstResult);
    assert.dom(directorsList).exists({ count: 1 });
    assert.dom(administratorsList).exists({ count: 1 });
    assert.dom(studentAdvisorsList).exists({ count: 1 });
  });

  test('add student advisor', async function (assert) {
    assert.expect(8);
    this.server.createList('user', 1);
    const user = await this.owner.lookup('service:store').find('user', 1);
    this.set('directors', [user]);
    this.set('administrators', [user]);
    this.set('studentAdvisors', []);
    this.set('add', (who) => {
      assert.equal(who, user, 'user passed correctly from action');
      this.set('studentAdvisors', [who]);
    });

    await render(hbs`<LeadershipManager
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
    />`);
    const directorsList = 'table tbody tr:nth-of-type(1) td:nth-of-type(1) li';
    const administratorsList = 'table tbody tr:nth-of-type(1) td:nth-of-type(2) li';
    const studentAdvisorsList = 'table tbody tr:nth-of-type(1) td:nth-of-type(3) li';
    const studentAdvisorSearch = '[data-test-student-advisor-search] input';
    const firstResult = '[data-test-result-index="1"]';

    assert.dom(directorsList).exists({ count: 1 });
    assert.dom(administratorsList).exists({ count: 1 });
    assert.dom(studentAdvisorsList).doesNotExist();

    await fillIn(studentAdvisorSearch, 'user');

    assert.ok(find(firstResult).textContent.includes('0 guy'));
    await click(firstResult);
    assert.dom(directorsList).exists({ count: 1 });
    assert.dom(administratorsList).exists({ count: 1 });
    assert.dom(studentAdvisorsList).exists({ count: 1 });
  });

  test('disabled users are indicated with an icon', async function (assert) {
    assert.expect(7);
    this.server.create('user', {
      enabled: true,
    });
    this.server.create('user', {
      enabled: false,
    });
    const users = await this.owner.lookup('service:store').findAll('user');

    this.set('directors', [users.firstObject]);
    this.set('administrators', users);

    await render(hbs`<LeadershipManager
      @showAdministrators={{true}}
      @showDirectors={{true}}
      @directors={{this.directors}}
      @administrators={{this.administrators}}
      @removeDirector={{(noop)}}
      @addDirector={{(noop)}}
      @removeAdministrator={{(noop)}}
      @addAdministrator={{(noop)}}
    />`);
    const directors = 'table tbody tr:nth-of-type(1) td:nth-of-type(1) li';
    const administrators = 'table tbody tr:nth-of-type(1) td:nth-of-type(2) li';
    const disabledDirectors = `${directors} .fa-user-times`;
    const disabledAdministrators = `${administrators} .fa-user-times`;
    const firstAdministratorName = `${administrators}:nth-of-type(1) [data-test-fullname]`;
    const secondAdministratorName = `${administrators}:nth-of-type(2) [data-test-fullname]`;

    assert.dom(directors).exists({ count: 1 });
    assert.dom(disabledDirectors).doesNotExist();
    assert.dom(findAll(directors)[0]).hasText('0 guy M. Mc0son');
    assert.dom(administrators).exists({ count: 2 });
    assert.dom(disabledAdministrators).exists({ count: 1 });
    assert.dom(firstAdministratorName).hasText('0 guy M. Mc0son');
    assert.dom(secondAdministratorName).hasText('1 guy M. Mc1son');
  });

  test('users are sorted by full name', async function (assert) {
    assert.expect(12);

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

    await render(hbs`<LeadershipManager
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
    />`);

    const directors = 'table tbody tr:nth-of-type(1) td:nth-of-type(1) li';
    const administrators = 'table tbody tr:nth-of-type(1) td:nth-of-type(2) li';
    const studentAdvisors = 'table tbody tr:nth-of-type(1) td:nth-of-type(3) li';

    [directors, administrators, studentAdvisors].forEach((users) => {
      assert.dom(users).exists({ count: 3 });
      assert.dom(`${users}:nth-of-type(1) [data-test-fullname]`).hasText('Aaron M. Aardvark');
      assert.dom(`${users}:nth-of-type(2) [data-test-fullname]`).hasText('The Bane of Iowa');
      assert.dom(`${users}:nth-of-type(3) [data-test-fullname]`).hasText('Ursula U. Unbekannt');
    });
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

    await render(hbs`<LeadershipManager
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
    />`);

    const directors = 'table tbody tr:nth-of-type(1) td:nth-of-type(1) li';
    const administrators = 'table tbody tr:nth-of-type(1) td:nth-of-type(2) li';
    const studentAdvisors = 'table tbody tr:nth-of-type(1) td:nth-of-type(3) li';

    await map([directors, administrators, studentAdvisors], async (users) => {
      assert.dom(users).exists({ count: 3 });
      assert.dom(`${users}:nth-of-type(1) [data-test-fullname]`).hasText('Aaron M. Aardvark');
      assert.dom(`${users}:nth-of-type(1) [data-test-info]`).doesNotExist();
      assert.dom(`${users}:nth-of-type(2) [data-test-fullname]`).hasText('The Bane of Iowa');
      assert.dom(find('.ilios-tooltip')).doesNotExist();
      await triggerEvent(find(`${users}:nth-of-type(2) [data-test-info]`), 'mouseover');
      assert.dom(find('.ilios-tooltip')).hasText('Campus name of record: Zeb M, Zoober');
      await triggerEvent(find(`${users}:nth-of-type(2) [data-test-info]`), 'mouseout');
      assert.dom(find('.ilios-tooltip')).doesNotExist();
      assert.dom(`${users}:nth-of-type(3) [data-test-fullname]`).hasText('Ursula U. Unbekannt');
      assert.dom(`${users}:nth-of-type(3) [data-test-info]`).doesNotExist();
    });
  });
});
