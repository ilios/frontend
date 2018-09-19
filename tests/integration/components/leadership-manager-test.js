import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  fillIn,
  click,
  findAll,
  find
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { run } from '@ember/runloop';

module('Integration | Component | leadership manager', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders with data', async function(assert) {
    assert.expect(5);
    this.server.createList('user', 2);
    const users = await run(() => this.owner.lookup('service:store').findAll('user'));
    this.set('directors', [users.firstObject]);
    this.set('administrators', users);
    this.set('nothing', parseInt);

    await render(hbs`{{leadership-manager
      directors=directors
      administrators=administrators
      removeDirector=(action nothing)
      addDirector=(action nothing)
      removeAdministrator=(action nothing)
      addAdministrator=(action nothing)
    }}`);
    const directors = 'table tbody tr:nth-of-type(1) td:nth-of-type(1) li';
    const administrators = 'table tbody tr:nth-of-type(1) td:nth-of-type(2) li';

    assert.dom(directors).exists({ count: 1 });
    assert.dom(findAll(directors)[0]).hasText('0 guy M. Mc0son');
    assert.dom(administrators).exists({ count: 2 });
    assert.dom(findAll(administrators)[0]).hasText('0 guy M. Mc0son');
    assert.dom(findAll(administrators)[1]).hasText('1 guy M. Mc1son');
  });

  test('it renders without data', async function(assert) {
    assert.expect(2);
    this.set('directors', []);
    this.set('administrators', []);
    this.set('nothing', parseInt);

    await render(hbs`{{leadership-manager
      directors=directors
      administrators=administrators
      removeDirector=(action nothing)
      addDirector=(action nothing)
      removeAdministrator=(action nothing)
      addAdministrator=(action nothing)
    }}`);
    const directors = 'table tbody tr:nth-of-type(1) td:nth-of-type(1) li';
    const administrators = 'table tbody tr:nth-of-type(1) td:nth-of-type(2) li';

    assert.dom(directors).doesNotExist();
    assert.dom(administrators).doesNotExist();
  });

  test('remove director', async function(assert) {
    assert.expect(3);
    this.server.createList('user', 1);
    const user = await run(() => this.owner.lookup('service:store').find('user', 1));
    this.set('directors', [user]);
    this.set('administrators', []);
    this.set('nothing', parseInt);
    this.set('remove', (who) => {
      assert.equal(who, user);
    });

    await render(hbs`{{leadership-manager
      directors=directors
      administrators=administrators
      removeDirector=(action remove)
      addDirector=(action nothing)
      removeAdministrator=(action nothing)
      addAdministrator=(action nothing)
    }}`);
    const list = 'table tbody tr:nth-of-type(1) td:nth-of-type(1) li';
    const icon = `${list}:nth-of-type(1) svg`;

    assert.dom(list).exists({ count: 1 });
    assert.dom(findAll(list)[0]).hasText('0 guy M. Mc0son');
    await click(icon);
  });

  test('remove administrator', async function(assert) {
    assert.expect(3);
    this.server.createList('user', 1);
    const user = await run(() => this.owner.lookup('service:store').find('user', 1));
    this.set('directors', []);
    this.set('administrators', [user]);
    this.set('nothing', parseInt);
    this.set('remove', (who) => {
      assert.equal(who, user);
    });

    await render(hbs`{{leadership-manager
      directors=directors
      administrators=administrators
      removeDirector=(action nothing)
      addDirector=(action nothing)
      removeAdministrator=(action remove)
      addAdministrator=(action nothing)
    }}`);
    const list = 'table tbody tr:nth-of-type(1) td:nth-of-type(2) li';
    const icon = `${list}:nth-of-type(1) svg`;

    assert.dom(list).exists({ count: 1 });
    assert.dom(findAll(list)[0]).hasText('0 guy M. Mc0son');
    await click(icon);
  });

  test('add director', async function(assert) {
    assert.expect(6);
    this.server.createList('user', 1);
    const user = await run(() => this.owner.lookup('service:store').find('user', 1));
    this.set('directors', []);
    this.set('administrators', [user]);
    this.set('nothing', parseInt);
    this.set('add', (who) => {
      assert.equal(who, user, 'user passed correctly from action');
      this.set('directors', [who]);
    });

    await render(hbs`{{leadership-manager
      directors=directors
      administrators=administrators
      removeDirector=(action nothing)
      addDirector=(action add)
      removeAdministrator=(action nothing)
      addAdministrator=(action nothing)
    }}`);
    const directorsList = 'table tbody tr:nth-of-type(1) td:nth-of-type(1) li';
    const administratorsList = 'table tbody tr:nth-of-type(1) td:nth-of-type(2) li';
    const directorSearch = '[data-test-director-search] input';
    const firstResult = '[data-test-result-index="1"]';

    assert.dom(directorsList).doesNotExist();
    assert.dom(administratorsList).exists({ count: 1 });
    await fillIn(directorSearch, 'user');

    assert.ok(find(firstResult).textContent.includes('0 guy'));
    await click(firstResult);
    assert.dom(directorsList).exists({ count: 1 });
    assert.dom(administratorsList).exists({ count: 1 });
  });

  test('add administrator', async function(assert) {
    assert.expect(6);
    this.server.createList('user', 1);
    const user = await run(() => this.owner.lookup('service:store').find('user', 1));
    this.set('directors', [user]);
    this.set('administrators', []);
    this.set('nothing', parseInt);
    this.set('add', (who) => {
      assert.equal(who, user, 'user passed correctly from action');
      this.set('administrators', [who]);
    });

    await render(hbs`{{leadership-manager
      directors=directors
      administrators=administrators
      removeDirector=(action nothing)
      addDirector=(action nothing)
      removeAdministrator=(action nothing)
      addAdministrator=(action add)
    }}`);
    const directorsList = 'table tbody tr:nth-of-type(1) td:nth-of-type(1) li';
    const administratorsList = 'table tbody tr:nth-of-type(1) td:nth-of-type(2) li';
    const administratorSearch = '[data-test-administrator-search] input';
    const firstResult = '[data-test-result-index="1"]';

    assert.dom(directorsList).exists({ count: 1 });
    assert.dom(administratorsList).doesNotExist();

    await fillIn(administratorSearch, 'user');

    assert.ok(find(firstResult).textContent.includes('0 guy'));
    await click(firstResult);
    assert.dom(directorsList).exists({ count: 1 });
    assert.dom(administratorsList).exists({ count: 1 });
  });

  test('disabled users are indicated with an icon', async function(assert) {
    assert.expect(7);
    this.server.create('user', {
      enabled: true
    });
    this.server.create('user', {
      enabled: false
    });
    const users = await run(() => this.owner.lookup('service:store').findAll('user'));

    this.set('directors', [users.firstObject]);
    this.set('administrators', users);
    this.set('nothing', parseInt);

    await render(hbs`{{leadership-manager
      directors=directors
      administrators=administrators
      removeDirector=(action nothing)
      addDirector=(action nothing)
      removeAdministrator=(action nothing)
      addAdministrator=(action nothing)
    }}`);
    const directors = 'table tbody tr:nth-of-type(1) td:nth-of-type(1) li';
    const administrators = 'table tbody tr:nth-of-type(1) td:nth-of-type(2) li';
    const disabledDirectors = `${directors} .fa-user-times`;
    const disabledAdministrators = `${administrators} .fa-user-times`;

    assert.dom(directors).exists({ count: 1 });
    assert.dom(disabledDirectors).doesNotExist();
    assert.dom(findAll(directors)[0]).hasText('0 guy M. Mc0son');
    assert.dom(administrators).exists({ count: 2 });
    assert.dom(disabledAdministrators).exists({ count: 1 });
    assert.dom(findAll(administrators)[0]).hasText('0 guy M. Mc0son');
    assert.dom(findAll(administrators)[1]).hasText('1 guy M. Mc1son');
  });
});
