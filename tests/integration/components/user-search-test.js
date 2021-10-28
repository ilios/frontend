import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | user search', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.server.get('api/users', (schema) => {
      return schema.users.all();
    });
  });

  test('it renders', async function (assert) {
    await render(hbs`<UserSearch />`);
    assert.dom('input').exists({ count: 1 });
  });

  test('less than 3 characters triggers warning', async function (assert) {
    await render(hbs`<UserSearch />`);

    await fillIn('input', 'ab');
    assert.dom('ul').hasText('keep typing...');
  });

  test('input triggers search', async function (assert) {
    assert.expect(4);
    this.server.create('user');
    this.server.get('api/users', (schema, { queryParams }) => {
      assert.strictEqual(queryParams['q'], 'search words');
      return schema.users.all();
    });
    await render(hbs`<UserSearch />`);

    await fillIn('input', 'search words');
    assert.dom('li').exists({ count: 2 });
    assert.dom('li:nth-of-type(1)').hasText('1 Results');
    assert.dom('li:nth-of-type(2)').hasText('0 guy M. Mc0son user@example.edu');
  });

  test('no results displays messages', async function (assert) {
    await render(hbs`<UserSearch />`);

    await fillIn('input', 'search words');
    assert.dom('li').hasText('no results');
  });

  test('search for groups', async function (assert) {
    this.server.createList('instructor-group', 2);
    const instructorGroups = this.owner.lookup('service:store').findAll('instructor-group');
    this.set('availableInstructorGroups', instructorGroups);
    await render(hbs`<UserSearch @availableInstructorGroups={{this.availableInstructorGroups}} />`);

    await fillIn('input', 'group');
    assert.dom('li').exists({ count: 3 });
    assert.dom('li:nth-of-type(1)').hasText('2 Results');
    assert.dom('li:nth-of-type(2)').hasText('instructor group 0');
    assert.dom('li:nth-of-type(3)').hasText('instructor group 1');
  });

  test('click user fires add user', async function (assert) {
    assert.expect(4);
    const user = this.server.create('user');

    this.set('action', (passedUser) => {
      assert.strictEqual(user.id, passedUser.id);
    });
    await render(hbs`<UserSearch @addUser={{fn this.action}} />`);

    await fillIn('input', 'test');
    assert.dom('li').exists({ count: 2 });
    assert.dom('li:nth-of-type(1)').hasText('1 Results');
    assert.dom('li:nth-of-type(2)').hasText('0 guy M. Mc0son user@example.edu');
    await click('[data-test-result]');
  });

  test('click group fires add group', async function (assert) {
    assert.expect(5);
    this.set('action', (group) => {
      assert.strictEqual(group.id, 1);
    });
    this.server.createList('instructor-group', 2);
    const instructorGroups = this.owner.lookup('service:store').findAll('instructor-group');
    this.set('availableInstructorGroups', instructorGroups);

    await render(hbs`<UserSearch
      @availableInstructorGroups={{this.availableInstructorGroups}}
      @addInstructorGroup={{fn this.action}}
    />`);

    await fillIn('input', 'group');
    assert.dom('li').exists({ count: 3 });
    assert.dom('li:nth-of-type(1)').hasText('2 Results');
    assert.dom('li:nth-of-type(2)').hasText('instructor group 0');
    assert.dom('li:nth-of-type(3)').hasText('instructor group 1');
    await click('[data-test-result]');
  });

  test('sorting is natural', async function (assert) {
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
    assert.dom('li').exists({ count: 5 });
    assert.dom('li:nth-of-type(1)').containsText('4 Results');
    assert.dom('li:nth-of-type(2)').containsText('person');
    assert.dom('li:nth-of-type(3)').containsText('3');
    assert.dom('li:nth-of-type(4)').containsText('10');
    assert.dom('li:nth-of-type(5)').containsText('20');
  });

  test('reads currentlyActiveUsers', async function (assert) {
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

  test('reads currentlyActiveUsers from a promise', async function (assert) {
    const user = this.server.create('user');
    this.server.get('api/users', (schema) => {
      return schema.users.all();
    });
    const userPromise = this.owner.lookup('service:store').query('user', { id: user.id });
    this.set('currentlyActiveUsersPromise', userPromise);
    await render(hbs`<UserSearch
      @currentlyActiveUsers={{await this.currentlyActiveUsersPromise}}
    />`);
    await fillIn('input', 'foo');

    assert.dom('[data-test-results-count]').hasText('1 Results');
    assert.dom('[data-test-result]').includesText('0 guy');
    assert.dom('[data-test-result]').hasClass('inactive');
  });

  test('reads currentlyActiveInstructorGroups', async function (assert) {
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

  test('reads currentlyActiveInstructorGroups from a promise', async function (assert) {
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
