import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  findAll,
  click,
  fillIn,
  find
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | user search', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    this.server.get('api/users', (schema) => {
      return schema.users.all();
    });
  });


  test('it renders', async function(assert) {
    await render(hbs`<UserSearch />`);
    assert.dom('input').exists({ count: 1 });
  });

  test('less than 3 characters triggers warning', async function(assert) {
    await render(hbs`<UserSearch />`);

    await fillIn('input', 'ab');
    assert.dom('ul').hasText('keep typing...');
  });

  test('input triggers search', async function (assert) {
    this.server.create('user');
    this.server.get('api/users', (schema, { queryParams }) => {
      assert.equal(queryParams['q'], 'search words');
      return schema.users.all();
    });
    await render(hbs`<UserSearch />`);

    await fillIn('input', 'search words');

    assert.dom('li').hasText('1 Results');
    assert.equal(find(findAll('li')[1]).textContent.replace(/[\t\n\s]+/g, ""), '0guyM.Mc0sonuser@example.edu');
  });

  test('no results displays messages', async function(assert) {
    await render(hbs`<UserSearch />`);

    await fillIn('input', 'search words');
    assert.dom('li').hasText('no results');
  });

  test('search for groups', async function (assert) {
    this.server.createList('instructor-group', 2);
    const instructorGroups = this.owner.lookup('service:store').findAll('instructor-group');
    this.set('availableInstructorGroups', instructorGroups);
    await render(hbs`<UserSearch @availableInstructorGroups={{availableInstructorGroups}} />`);

    await fillIn('input', 'group');
    assert.dom('li').hasText('2 Results');
    assert.dom(findAll('li')[1]).hasText('instructor group 0');
    assert.dom(findAll('li')[2]).hasText('instructor group 1');
  });

  test('click user fires add user', async function(assert) {
    const user = this.server.create('user');

    this.set('action', passedUser => {
      assert.equal(user.id, passedUser.id);
    });
    await render(hbs`<UserSearch @addUser={{action action}} />`);

    await fillIn('input', 'test');
    assert.equal(findAll('li')[1].textContent.replace(/[\t\n\s]+/g, ""), '0guyM.Mc0sonuser@example.edu');
    await click(findAll('li')[1]);
  });

  test('click group fires add group', async function(assert) {
    this.set('action', group => {
      assert.equal(1, group.id);
    });
    this.server.createList('instructor-group', 2);
    const instructorGroups = this.owner.lookup('service:store').findAll('instructor-group');
    this.set('availableInstructorGroups', instructorGroups);

    await render(hbs`<UserSearch
      @availableInstructorGroups={{availableInstructorGroups}}
      @addInstructorGroup={{action action}}
    />`);

    await fillIn('input', 'group');
    assert.dom(findAll('li')[1]).hasText('instructor group 0');
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

    await render(hbs`<UserSearch />`);
    await fillIn('input', 'person');

    const items = '.results li';
    const first = `${items}:nth-of-type(1)`;
    const second = `${items}:nth-of-type(2)`;
    const third = `${items}:nth-of-type(3)`;
    const fourth = `${items}:nth-of-type(4)`;
    const fifth = `${items}:nth-of-type(5)`;

    assert.dom(first).hasText('4 Results');
    assert.dom(second).includesText('person');
    assert.dom(third).includesText('3');
    assert.dom(fourth).includesText('10');
    assert.dom(fifth).includesText('20');
  });

  test('reads currentlyActiveUsers', async function(assert) {
    const user = this.server.create('user');
    this.server.get('api/users', (schema) => {
      return schema.users.all();
    });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    this.set('currentlyActiveUsers', [userModel]);
    await render(hbs`<UserSearch @currentlyActiveUsers={{this.currentlyActiveUsers}} />`);
    await fillIn('input', 'foo');

    assert.dom('[data-test-results-count]').hasText('1 Results');
    assert.dom('[data-test-result]').includesText('0 guy');
    assert.dom('[data-test-result]').hasClass('inactive');
  });

  test('reads currentlyActiveUsers from a promise', async function(assert) {
    const user = this.server.create('user');
    this.server.get('api/users', (schema) => {
      return schema.users.all();
    });
    const userPromise = this.owner.lookup('service:store').query('user', { id : user.id });
    this.set('currentlyActiveUsersPromise', userPromise);
    await render(hbs`<UserSearch
      @currentlyActiveUsers={{await this.currentlyActiveUsersPromise}}
    />`);
    await fillIn('input', 'foo');

    assert.dom('[data-test-results-count]').hasText('1 Results');
    assert.dom('[data-test-result]').includesText('0 guy');
    assert.dom('[data-test-result]').hasClass('inactive');
  });

  test('reads currentlyActiveInstructorGroups', async function(assert) {
    this.server.create('instructor-group');
    const instructorGroups = await this.owner.lookup('service:store').findAll('instructor-group');
    this.set('availableInstructorGroups', instructorGroups);
    this.set('currentlyActiveInstructorGroups', instructorGroups);
    await render(hbs`<UserSearch
      @availableInstructorGroups={{this.availableInstructorGroups}}
      @currentlyActiveInstructorGroups={{this.currentlyActiveInstructorGroups}}
    />`);
    await fillIn('input', 'group');

    assert.dom('[data-test-results-count]').hasText('1 Results');
    assert.dom('[data-test-result]').includesText('instructor group 0');
    assert.dom('[data-test-result]').hasClass('inactive');
  });

  test('reads currentlyActiveInstructorGroups from a promise', async function(assert) {
    this.server.create('instructor-group');
    const instructorGroups = this.owner.lookup('service:store').findAll('instructor-group');
    this.set('availableInstructorGroups', instructorGroups);
    this.set('currentlyActiveInstructorGroups', instructorGroups);
    await render(hbs`<UserSearch
      @availableInstructorGroups={{this.availableInstructorGroups}}
      @currentlyActiveInstructorGroups={{await this.currentlyActiveInstructorGroups}}
    />`);
    await fillIn('input', 'group');

    assert.dom('[data-test-results-count]').hasText('1 Results');
    assert.dom('[data-test-result]').includesText('instructor group 0');
    assert.dom('[data-test-result]').hasClass('inactive');
  });
});
