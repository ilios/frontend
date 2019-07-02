import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Unit | Service | search', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('it exists', function(assert) {
    let service = this.owner.lookup('service:search');
    assert.ok(service);
  });

  test('test search for curriculum', async function (assert) {
    assert.expect(3);
    const courses = [
      { id: 1, title: 'Sweet', sessions: [] },
    ];
    const autocomplete = ['one', 'two'];
    this.server.get('search/v1/curriculum', (schema, { queryParams }) => {
      assert.equal(queryParams.q, 'codejam');
      assert.equal(queryParams.size, 1000);
      return {
        results: {
          courses,
          autocomplete
        }
      };
    });
    let service = this.owner.lookup('service:search');
    const results = await service.forCurriculum('codejam');
    assert.deepEqual(results, { courses, autocomplete });
  });

  test('test search for users', async function (assert) {
    assert.expect(9);
    this.server.get('search/v1/users', (schema, { queryParams }) => {
      assert.equal(queryParams.q, 'codejam');
      assert.equal(queryParams.size, 100);
      return {
        results: {
          users: [
            {id: 1, firstName: 'Stefan', lastName: 'Dude', middleName: 'Awesome'},
            {id: 2, firstName: 'Sascha', lastName: 'B', displayName: 'IliosMan'},
            {id: 3, firstName: 'Dave', lastName: 'Lombard'},
          ],
          autocomplete: ['one', 'two']
        }
      };
    });
    let service = this.owner.lookup('service:search');
    const results = await service.forUsers('codejam');
    assert.ok('users' in results);
    assert.ok('autocomplete' in results);
    const { users, autocomplete } = results;
    assert.equal(users[0].fullName, 'Stefan A. Dude');
    assert.equal(users[1].fullName, 'IliosMan');
    assert.equal(users[2].fullName, 'Dave Lombard');
    assert.equal(autocomplete[0], 'one');
    assert.equal(autocomplete[1], 'two');
  });

  test('test search for users with size parameters', async function (assert) {
    assert.expect(2);
    this.server.get('search/v1/users', (schema, { queryParams }) => {
      assert.equal(queryParams.q, 'codejam');
      assert.equal(queryParams.size, 9);
      return {
        results: {
          users: [],
          autocomplete: []
        }
      };
    });
    let service = this.owner.lookup('service:search');
    await service.forUsers('codejam', 9);
  });

  test('test search for users with onlySuggest parameters', async function (assert) {
    assert.expect(3);
    this.server.get('search/v1/users', (schema, { queryParams }) => {
      assert.equal(queryParams.q, 'codejam');
      assert.equal(queryParams.size, 19);
      assert.equal(queryParams.onlySuggest, 'true');
      return {
        results: {
          users: [],
          autocomplete: ['one', 'two']
        }
      };
    });
    let service = this.owner.lookup('service:search');
    await service.forUsers('codejam', 19, true);
  });

  test('test search for curriculum with onlySuggest parameters', async function (assert) {
    assert.expect(3);
    this.server.get('search/v1/curriculum', (schema, { queryParams }) => {
      assert.equal(queryParams.q, 'codejam');
      assert.equal(queryParams.size, 1000);
      assert.equal(queryParams.onlySuggest, 'true');
      return {
        results: {
          courses: [],
          autocomplete: ['one', 'two']
        }
      };
    });
    let service = this.owner.lookup('service:search');
    await service.forCurriculum('codejam', true);
  });
});
