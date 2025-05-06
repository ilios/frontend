import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { component } from 'ilios-common/page-objects/components/user-search';
import UserSearch from 'ilios-common/components/user-search';

module('Integration | Component | user search', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.server.get('api/users', (schema) => {
      return schema.users.all();
    });
  });

  test('it renders', async function (assert) {
    await render(<template><UserSearch /></template>);
    assert.ok(component.searchBox.isVisible);
    assert.strictEqual(component.results.items.length, 0);
    assert.notOk(component.resultsCount.isVisible);
  });

  test('less than 3 characters triggers warning', async function (assert) {
    await render(<template><UserSearch /></template>);
    await component.searchBox.set('ab');
    assert.strictEqual(component.results.text, 'keep typing...');
  });

  test('input triggers search', async function (assert) {
    assert.expect(4);
    this.server.create('user');
    this.server.get('api/users', (schema, { queryParams }) => {
      assert.strictEqual(queryParams['q'], 'search words');
      return schema.users.all();
    });
    await render(<template><UserSearch /></template>);
    await component.searchBox.set('search words');
    assert.strictEqual(component.resultsCount.text, '1 Results');
    assert.strictEqual(component.results.items.length, 1);
    assert.strictEqual(component.results.items[0].text, '0 guy M. Mc0son user@example.edu');
  });

  test('no results displays messages', async function (assert) {
    await render(<template><UserSearch /></template>);
    await component.searchBox.set('search words');
    assert.strictEqual(component.results.text, 'no results');
  });

  test('search for groups', async function (assert) {
    this.server.createList('instructor-group', 2);
    const instructorGroups = await this.owner.lookup('service:store').findAll('instructor-group');
    this.set('availableInstructorGroups', instructorGroups);
    await render(
      <template>
        <UserSearch @availableInstructorGroups={{this.availableInstructorGroups}} />
      </template>,
    );
    await component.searchBox.set('group');
    assert.strictEqual(component.resultsCount.text, '2 Results');
    assert.strictEqual(component.results.items.length, 2);
    assert.strictEqual(component.results.items[0].text, 'instructor group 0');
    assert.strictEqual(component.results.items[1].text, 'instructor group 1');
  });

  test('click user fires add user', async function (assert) {
    assert.expect(4);
    const user = this.server.create('user');
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    this.set('action', (passedUser) => {
      assert.strictEqual(passedUser, userModel);
    });
    await render(<template><UserSearch @addUser={{this.action}} /></template>);
    await component.searchBox.set('test');
    assert.strictEqual(component.resultsCount.text, '1 Results');
    assert.strictEqual(component.results.items.length, 1);
    assert.strictEqual(component.results.items[0].text, '0 guy M. Mc0son user@example.edu');
    await component.results.items[0].click();
  });

  test('click group fires add group', async function (assert) {
    assert.expect(5);
    this.server.createList('instructor-group', 2);
    const instructorGroups = await this.owner.lookup('service:store').findAll('instructor-group');
    this.set('action', (group) => {
      assert.strictEqual(group, instructorGroups[0]);
    });
    this.set('availableInstructorGroups', instructorGroups);
    await render(
      <template>
        <UserSearch
          @availableInstructorGroups={{this.availableInstructorGroups}}
          @addInstructorGroup={{this.action}}
        />
      </template>,
    );
    await component.searchBox.set('group');
    assert.strictEqual(component.resultsCount.text, '2 Results');
    assert.strictEqual(component.results.items.length, 2);
    assert.strictEqual(component.results.items[0].text, 'instructor group 0');
    assert.strictEqual(component.results.items[1].text, 'instructor group 1');
    await component.results.items[0].click();
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
    await render(<template><UserSearch /></template>);
    await component.searchBox.set('person');
    assert.strictEqual(component.resultsCount.text, '4 Results');
    assert.strictEqual(component.results.items.length, 4);
    assert.strictEqual(component.results.items[0].text, '3 guy M. person user@example.edu');
    assert.strictEqual(component.results.items[1].text, '3 M. person user@example.edu');
    assert.strictEqual(component.results.items[2].text, '10 M. person user@example.edu');
    assert.strictEqual(component.results.items[3].text, '20 M. person user@example.edu');
  });

  test('reads currentlyActiveUsers', async function (assert) {
    const user = this.server.create('user');
    this.server.get('api/users', (schema) => {
      return schema.users.all();
    });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    this.set('currentlyActiveUsers', [userModel]);
    await render(
      <template><UserSearch @currentlyActiveUsers={{this.currentlyActiveUsers}} /></template>,
    );
    await component.searchBox.set('foo');
    assert.strictEqual(component.resultsCount.text, '1 Results');
    assert.strictEqual(component.results.items.length, 1);
    assert.strictEqual(component.results.items[0].text, '0 guy M. Mc0son user@example.edu');
    assert.notOk(component.results.items[0].isActive);
  });

  test('reads currentlyActiveUsers from a promise', async function (assert) {
    const user = this.server.create('user');
    this.server.get('api/users', (schema) => {
      return schema.users.all();
    });
    const users = this.owner.lookup('service:store').query('user', { id: user.id });
    this.set('currentlyActiveUsers', users);
    await render(
      <template><UserSearch @currentlyActiveUsers={{this.currentlyActiveUsers}} /></template>,
    );
    await component.searchBox.set('foo');
    assert.strictEqual(component.resultsCount.text, '1 Results');
    assert.strictEqual(component.results.items.length, 1);
    assert.strictEqual(component.results.items[0].text, '0 guy M. Mc0son user@example.edu');
    assert.notOk(component.results.items[0].isActive);
  });

  test('reads currentlyActiveInstructorGroups', async function (assert) {
    this.server.create('instructor-group');
    const instructorGroups = await this.owner.lookup('service:store').findAll('instructor-group');
    this.set('availableInstructorGroups', instructorGroups);
    this.set('currentlyActiveInstructorGroups', instructorGroups);
    await render(
      <template>
        <UserSearch
          @availableInstructorGroups={{this.availableInstructorGroups}}
          @currentlyActiveInstructorGroups={{this.currentlyActiveInstructorGroups}}
        />
      </template>,
    );
    await component.searchBox.set('group');
    assert.strictEqual(component.resultsCount.text, '1 Results');
    assert.strictEqual(component.results.items.length, 1);
    assert.strictEqual(component.results.items[0].text, 'instructor group 0');
    assert.notOk(component.results.items[0].isActive);
  });

  test('reads currentlyActiveInstructorGroups from a promise', async function (assert) {
    this.server.create('instructor-group');
    const igPromise = this.owner.lookup('service:store').findAll('instructor-group');
    this.set('availableInstructorGroups', await igPromise);
    this.set('currentlyActiveInstructorGroups', igPromise);
    await render(
      <template>
        <UserSearch
          @availableInstructorGroups={{this.availableInstructorGroups}}
          @currentlyActiveInstructorGroups={{this.currentlyActiveInstructorGroups}}
        />
      </template>,
    );
    await component.searchBox.set('group');
    assert.strictEqual(component.resultsCount.text, '1 Results');
    assert.strictEqual(component.results.items.length, 1);
    assert.strictEqual(component.results.items[0].text, 'instructor group 0');
    assert.notOk(component.results.items[0].isActive);
  });
});
