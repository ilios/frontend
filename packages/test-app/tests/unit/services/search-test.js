import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMSW } from 'ilios-common/msw';

module('Unit | Service | search', function (hooks) {
  setupTest(hooks);
  setupMSW(hooks);

  test('it exists', function (assert) {
    const service = this.owner.lookup('service:search');
    assert.ok(service);
  });

  test('test search for curriculum', async function (assert) {
    const courses = [{ id: 1, title: 'Sweet', sessions: [] }];
    const autocomplete = ['one', 'two'];
    this.server.get('api/search/v2/curriculum', ({ request }) => {
      const { searchParams } = new URL(request.url);
      assert.strictEqual(searchParams.get('q'), 'codejam');
      assert.strictEqual(Number(searchParams.get('size')), 10);
      assert.strictEqual(Number(searchParams.get('from')), 11);
      assert.strictEqual(searchParams.get('schools'), '1-2');
      assert.strictEqual(searchParams.get('years'), '2021-2028');
      assert.step('API called');
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
    assert.verifySteps(['API called']);
  });

  test('test search for users', async function (assert) {
    this.server.get('api/search/v1/users', ({ request }) => {
      const { searchParams } = new URL(request.url);
      assert.strictEqual(searchParams.get('q'), 'codejam');
      assert.strictEqual(Number(searchParams.get('size')), 100);
      assert.step('API called');
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
    assert.verifySteps(['API called']);
  });

  test('test search for users with size parameters', async function (assert) {
    this.server.get('api/search/v1/users', ({ request }) => {
      const { searchParams } = new URL(request.url);
      assert.strictEqual(searchParams.get('q'), 'codejam');
      assert.strictEqual(Number(searchParams.get('size')), 9);
      assert.step('API called');
      return {
        results: {
          users: [],
          autocomplete: [],
        },
      };
    });
    const service = this.owner.lookup('service:search');
    await service.forUsers('codejam', 9);
    assert.verifySteps(['API called']);
  });

  test('test search for users with onlySuggest parameters', async function (assert) {
    this.server.get('api/search/v1/users', ({ request }) => {
      const { searchParams } = new URL(request.url);
      assert.strictEqual(searchParams.get('q'), 'codejam');
      assert.strictEqual(Number(searchParams.get('size')), 19);
      assert.strictEqual(searchParams.get('onlySuggest'), 'true');
      assert.step('API called');
      return {
        results: {
          users: [],
          autocomplete: ['one', 'two'],
        },
      };
    });
    const service = this.owner.lookup('service:search');
    await service.forUsers('codejam', 19, true);
    assert.verifySteps(['API called']);
  });
});
