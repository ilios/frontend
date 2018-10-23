import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, click, fillIn, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { run } from '@ember/runloop';

module('Integration | Component | user search', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    this.server.get('api/users', (schema) => {
      return schema.users.all();
    });
  });


  test('it renders', async function(assert) {
    await render(hbs`{{user-search}}`);
    assert.equal(findAll('input').length, 1);
  });

  test('less than 3 charecters triggers warning', async function(assert) {
    await render(hbs`{{user-search}}`);

    await fillIn('input', 'ab');
    assert.equal(find('ul').textContent.trim(), 'keep typing...');
  });

  test('input triggers search', async function (assert) {
    this.server.create('user');
    this.server.get('api/users', (schema, { queryParams }) => {
      assert.equal(queryParams['q'], 'search words');
      return schema.users.all();
    });
    await render(hbs`{{user-search}}`);

    await fillIn('input', 'search words');

    assert.equal(find('li').textContent.trim(), '1 Results');
    assert.equal(find(findAll('li')[1]).textContent.replace(/[\t\n\s]+/g, ""), '0guyM.Mc0sonuser@example.edu');
  });

  test('no results displays messages', async function(assert) {
    await render(hbs`{{user-search}}`);

    await fillIn('input', 'search words');
    assert.equal(find('li').textContent.trim(), 'no results');
  });

  test('search for groups', async function (assert) {
    this.server.createList('instructor-group', 2);
    const instructorGroups = await run(() => this.owner.lookup('service:store').findAll('instructor-group'));
    this.set('availableInstructorGroups', instructorGroups);
    await render(hbs`{{user-search availableInstructorGroups=availableInstructorGroups}}`);

    await fillIn('input', 'group');
    assert.equal(find('li').textContent.trim(), '2 Results');
    assert.equal(find(findAll('li')[1]).textContent.trim(), 'instructor group 0');
    assert.equal(find(findAll('li')[2]).textContent.trim(), 'instructor group 1');
  });

  test('click user fires add user', async function(assert) {
    const user = this.server.create('user');

    this.set('action', passedUser => {
      assert.equal(user.id, passedUser.id);
    });
    await render(hbs`{{user-search addUser=(action action)}}`);

    await fillIn('input', 'test');
    assert.equal(findAll('li')[1].textContent.replace(/[\t\n\s]+/g, ""), '0guyM.Mc0sonuser@example.edu');
    await click(findAll('li')[1]);
  });

  test('click group fires add group', async function(assert) {
    this.set('action', group => {
      assert.equal(1, group.id);
    });
    this.server.createList('instructor-group', 2);
    const instructorGroups = await run(() => this.owner.lookup('service:store').findAll('instructor-group'));
    this.set('availableInstructorGroups', instructorGroups);

    await render(
      hbs`{{user-search availableInstructorGroups=availableInstructorGroups addInstructorGroup=(action action)}}`
    );

    await fillIn('input', 'group');
    assert.equal(findAll('li')[1].textContent.trim(), 'instructor group 0');
    await click(findAll('li')[1]);
  });

  test('sorting is natural', async function(assert) {
    this.server.create('user', {
      firstName: '20',
      lastName: 'person',
    });
    this.server.create('user', {
      firstName: '10',
      lastName: 'person',
    });
    this.server.create('user', {
      firstName: '3',
      lastName: 'person',
    });
    this.server.create('user', {
      lastName: 'person',
    });

    await render(hbs`{{user-search}}`);
    await fillIn('input', 'person');

    const items = '.results li';
    const first = `${items}:nth-of-type(1)`;
    const second = `${items}:nth-of-type(2)`;
    const third = `${items}:nth-of-type(3)`;
    const fourth = `${items}:nth-of-type(4)`;
    const fifth = `${items}:nth-of-type(5)`;

    assert.ok(find(first).textContent.includes('4 Results'));
    assert.ok(find(second).textContent.includes('person'));
    assert.ok(find(third).textContent.includes('3'));
    assert.ok(find(fourth).textContent.includes('10'));
    assert.ok(find(fifth).textContent.includes('20'));
  });
});
