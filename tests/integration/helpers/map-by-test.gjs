// taken from Ember Composable Helpers (https://github.com/DockYard/ember-composable-helpers), then modified.

import { A as emberArray } from '@ember/array';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import mapBy from 'ilios-common/helpers/map-by';

module('Integration | Helper | map-by', function (hooks) {
  setupRenderingTest(hooks);

  test('It maps by value', async function (assert) {
    this.set('array', emberArray([{ name: 'a' }, { name: 'b' }, { name: 'c' }]));

    await render(
      <template>
        {{~#each (mapBy "name" this.array) as |name|~}}
          {{~name~}}
        {{~/each~}}
      </template>,
    );

    assert.dom().hasText('abc', 'name property is mapped');
  });

  test('It works with ember-data model', async function (assert) {
    let store = this.owner.lookup('service:store');
    let person = store.createRecord('user', {
      firstName: 'Janusz',
    });
    this.set('array', [person]);

    await render(
      <template>
        {{~#each (mapBy "firstName" this.array) as |name|~}}
          {{~name~}}
        {{~/each~}}
      </template>,
    );

    assert.dom().hasText('Janusz', 'first name property is mapped');
  });

  test('It watches for changes', async function (assert) {
    let array = emberArray([{ name: 'a' }, { name: 'b' }, { name: 'c' }]);

    this.set('array', array);

    await render(
      <template>
        {{~#each (mapBy "name" this.array) as |name|~}}
          {{~name~}}
        {{~/each~}}
      </template>,
    );

    // eslint-disable-next-line ember/no-runloop
    run(() => array.pushObject({ name: 'd' }));

    assert.dom().hasText('abcd', 'd is added');
  });

  test('It watches for changes to byPath', async function (assert) {
    let array = emberArray([
      { name: 'a', x: 1 },
      { name: 'b', x: 2 },
      { name: 'c', x: 3 },
    ]);

    this.set('array', array);
    this.set('property', 'name');

    await render(
      <template>
        {{~#each (mapBy this.property this.array) as |name|~}}
          {{~name~}}
        {{~/each~}}
      </template>,
    );

    this.set('property', 'x');

    assert.dom().hasText('123', '123 is displayed');
  });

  test('It allows null arrays', async function (assert) {
    this.set('array', null);

    await render(
      <template>
        {{~#each (mapBy "name" this.array) as |name|~}}
          {{~name~}}
        {{~/each~}}
      </template>,
    );

    assert.dom().hasText('', 'this is all that will render, but there is no error');
  });

  test('It allows undefined arrays', async function (assert) {
    this.set('array', undefined);

    await render(
      <template>
        {{~#each (mapBy "name" this.array) as |name|~}}
          {{~name~}}
        {{~/each~}}
      </template>,
    );

    assert.dom().hasText('', 'this is all that will render, but there is no error');
  });

  test('it accepts a fulfilled ember data promise as a value', async function (assert) {
    let store = this.owner.lookup('service:store');
    let learnerGroup = store.createRecord('learner-group');

    let users = await learnerGroup.users;
    users.push(
      store.createRecord('user', { firstName: 'a' }),
      store.createRecord('user', { firstName: 'b' }),
      store.createRecord('user', { firstName: 'c' }),
    );

    this.set('users', users);

    await render(
      <template>
        {{~#each (mapBy "firstName" this.users) as |name|~}}
          {{~name~}}
        {{~/each~}}
      </template>,
    );

    assert.dom().hasText('abc', 'first name property is mapped');
  });
});
