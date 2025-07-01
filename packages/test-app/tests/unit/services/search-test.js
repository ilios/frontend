import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'test-app/tests/test-support/mirage';

module('Unit | Service | search', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('it exists', function (assert) {
    const service = this.owner.lookup('service:search');
    assert.ok(service);
  });

  test('test search for curriculum', async function (assert) {
    assert.expect(6);
    const courses = [{ id: 1, title: 'Sweet', sessions: [] }];
    const autocomplete = ['one', 'two'];
    this.server.get('api/search/v2/curriculum', (schema, { queryParams }) => {
      assert.strictEqual(queryParams.q, 'codejam');
      assert.strictEqual(Number(queryParams.size), 10);
      assert.strictEqual(Number(queryParams.from), 11);
      assert.strictEqual(queryParams.schools, '1-2');
      assert.strictEqual(queryParams.years, '2021-2028');
      return {
        results: {
          courses,
          autocomplete,
        },
      };
    });
    const service = this.owner.lookup('service:search');
    const results = await service.forCurriculum('codejam', 10, 11, [1, 2], [2021, 2028]);
    assert.deepEqual(results, { courses, autocomplete });
  });

  test('test search for users', async function (assert) {
    assert.expect(9);
    this.server.get('api/search/v1/users', (schema, { queryParams }) => {
      assert.strictEqual(queryParams.q, 'codejam');
      assert.strictEqual(parseInt(queryParams.size, 10), 100);
      return {
        results: {
          users: [
            {
              id: 1,
              firstName: 'Stefan',
              lastName: 'Dude',
              middleName: 'Awesome',
            },
            {
              id: 2,
              firstName: 'Sascha',
              lastName: 'B',
              displayName: 'IliosMan',
            },
            { id: 3, firstName: 'Dave', lastName: 'Lombard' },
          ],
          autocomplete: ['one', 'two'],
        },
      };
    });
    const service = this.owner.lookup('service:search');
    const results = await service.forUsers('codejam');
    assert.ok('users' in results);
    assert.ok('autocomplete' in results);
    const { users, autocomplete } = results;
    assert.strictEqual(users[0].fullName, 'Stefan A. Dude');
    assert.strictEqual(users[1].fullName, 'IliosMan');
    assert.strictEqual(users[2].fullName, 'Dave Lombard');
    assert.strictEqual(autocomplete[0], 'one');
    assert.strictEqual(autocomplete[1], 'two');
  });

  test('test search for users with size parameters', async function (assert) {
    assert.expect(2);
    this.server.get('api/search/v1/users', (schema, { queryParams }) => {
      assert.strictEqual(queryParams.q, 'codejam');
      assert.strictEqual(parseInt(queryParams.size, 10), 9);
      return {
        results: {
          users: [],
          autocomplete: [],
        },
      };
    });
    const service = this.owner.lookup('service:search');
    await service.forUsers('codejam', 9);
  });

  test('test search for users with onlySuggest parameters', async function (assert) {
    assert.expect(3);
    this.server.get('api/search/v1/users', (schema, { queryParams }) => {
      assert.strictEqual(queryParams.q, 'codejam');
      assert.strictEqual(Number(queryParams.size), 19);
      assert.strictEqual(queryParams.onlySuggest, 'true');
      return {
        results: {
          users: [],
          autocomplete: ['one', 'two'],
        },
      };
    });
    const service = this.owner.lookup('service:search');
    await service.forUsers('codejam', 19, true);
  });
});
