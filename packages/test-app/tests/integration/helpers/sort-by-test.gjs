// taken from Ember Composable Helpers (https://github.com/DockYard/ember-composable-helpers), then modified.

import { A as emberArray } from '@ember/array';
import { run } from '@ember/runloop';
import { module, test, skip } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import sortBy from 'ilios-common/helpers/sort-by';

module('Integration | Helper | sort-by', function (hooks) {
  setupRenderingTest(hooks);

  test('It sorts by a value ascending', async function (assert) {
    this.set('array', [{ name: 'c' }, { name: 'a' }, { name: 'b' }, { name: 'c' }]);

    await render(
      <template>
        {{~#each (sortBy "name" this.array) as |user|~}}
          {{~user.name~}}
        {{~/each~}}
      </template>,
    );

    assert.dom().hasText('abcc', 'cabc is sorted to abcc');
  });

  test('It sorts by multiletter words ascending', async function (assert) {
    this.set('array', [{ name: 'Aa' }, { name: 'aA' }, { name: 'cB' }, { name: 'bc' }]);

    await render(
      <template>
        {{~#each (sortBy "name" this.array) as |user|~}}
          {{~user.name~}}
        {{~/each~}}
      </template>,
    );

    assert.dom().hasText('AaaAbccB', 'sorts multiletter words');
  });

  test('It sorts by multiletter words descending', async function (assert) {
    this.set('array', [{ name: 'Aa' }, { name: 'aA' }, { name: 'bc' }, { name: 'cb' }]);

    await render(
      <template>
        {{~#each (sortBy "name:desc" this.array) as |user|~}}
          {{~user.name~}}
        {{~/each~}}
      </template>,
    );

    assert.dom().hasText('cbbcAaaA', 'sorts multiletter words');
  });

  test('It sorts by a value Numbers strings', async function (assert) {
    this.set('array', [{ value: '1' }, { value: '0' }, { value: '1' }, { value: '2' }]);

    await render(
      <template>
        {{~#each (sortBy "value" this.array) as |user|~}}
          {{~user.value~}}
        {{~/each~}}
      </template>,
    );

    assert.dom().hasText('0112', 'numbes are sorted');
  });

  test('It sorts by a value Number', async function (assert) {
    this.set('array', [{ value: 1 }, { value: 0 }, { value: 1 }, { value: 2 }]);

    await render(
      <template>
        {{~#each (sortBy "value" this.array) as |user|~}}
          {{~user.value~}}
        {{~/each~}}
      </template>,
    );

    assert.dom().hasText('0112', 'numbes are sorted');
  });

  test('It sorts by a value based on Alphabetical (vs ASCII-betical)', async function (assert) {
    this.set('array', [{ name: 'c' }, { name: 'C' }, { name: 'b' }]);

    await render(
      <template>
        {{~#each (sortBy "name" this.array) as |user|~}}
          {{~user.name~}}
        {{~/each~}}
      </template>,
    );

    assert.dom().hasText('bcC', 'outputs alphabetical ordering with b before c');
  });

  skip('It sorts by a value based on Alphanumeric', async function (assert) {
    this.set('array', [{ name: 'c1' }, { name: 'c11' }, { name: 'c2' }, { name: 'c100' }]);

    await render(
      <template>
        {{~#each (sortBy "name" this.array) as |user|~}}
          {{~user.name~}}
        {{~/each~}}
      </template>,
    );

    assert.dom().hasText('c1c2c11c100', 'alpha numeric is sorted properly');
  });

  test('It sorts by a value with EmberArray', async function (assert) {
    this.set('array', emberArray([{ name: 'c' }, { name: 'a' }, { name: 'b' }]));

    await render(
      <template>
        {{~#each (sortBy "name" this.array) as |user|~}}
          {{~user.name~}}
        {{~/each~}}
      </template>,
    );

    assert.dom().hasText('abc', 'cab is sorted to abc');
  });

  test('It sorts by a value desc', async function (assert) {
    this.set('array', emberArray([{ name: 'c' }, { name: 'a' }, { name: 'b' }, { name: 'a' }]));

    await render(
      <template>
        {{~#each (sortBy "name:desc" this.array) as |user|~}}
          {{~user.name~}}
        {{~/each~}}
      </template>,
    );

    assert.dom().hasText('cbaa', 'caba is sorted to cbaa');
  });

  test('It does not sort the array when the key is an empty string', async function (assert) {
    this.set('array', emberArray([{ name: 'c' }, { name: 'a' }, { name: 'b' }]));

    await render(
      <template>
        {{~#each (sortBy "" this.array) as |user|~}}
          {{~user.name~}}
        {{~/each~}}
      </template>,
    );

    assert.dom().hasText('cab', 'cab is unsorted');
  });

  test('It watches for changes', async function (assert) {
    let array = emberArray([{ name: 'b' }, { name: 'a' }, { name: 'd' }]);

    this.set('array', array);

    await render(
      <template>
        {{~#each (sortBy "name" this.array) as |user|~}}
          {{~user.name~}}
        {{~/each~}}
      </template>,
    );
    // eslint-disable-next-line ember/no-runloop
    run(() => array.pushObject({ name: 'c' }));

    assert.dom().hasText('abcd', 'list is still sorted after addition');
  });

  test('It accepts an array of sort properties (one prop)', async function (assert) {
    this.set('array', emberArray([{ name: 'c' }, { name: 'a' }, { name: 'b' }]));

    this.set('sortBy', ['name']);

    await render(
      <template>
        {{~#each (sortBy this.sortBy this.array) as |user|~}}
          {{~user.name~}}
        {{~/each~}}
      </template>,
    );

    assert.dom().hasText('abc', 'cab is sorted to abc');
  });

  test('It accepts an array of sort properties (more than one prop)', async function (assert) {
    this.set(
      'array',
      emberArray([
        { firstName: 'Adam', lastName: 'Coda' },
        { firstName: 'Billy', lastName: 'Jones' },
        { firstName: 'William', lastName: 'Abrams' },
        { firstName: 'Sam', lastName: 'Jones' },
        { firstName: 'Donnie', lastName: 'Brady' },
      ]),
    );

    this.set('sortBy', ['lastName', 'firstName']);

    await render(
      <template>
        {{~#each (sortBy this.sortBy this.array) as |user|~}}
          {{~user.lastName~}}{{~user.firstName~}}
        {{~/each~}}
      </template>,
    );

    assert
      .dom()
      .hasText(
        'AbramsWilliamBradyDonnieCodaAdamJonesBillyJonesSam',
        'Names are sorted alphabetically by last name then first name',
      );
  });

  test('It accepts multiple sort properties as helper params', async function (assert) {
    this.set(
      'array',
      emberArray([
        { firstName: 'Adam', lastName: 'Coda' },
        { firstName: 'Billy', lastName: 'Jones' },
        { firstName: 'William', lastName: 'Abrams' },
        { firstName: 'Sam', lastName: 'Jones' },
        { firstName: 'Donnie', lastName: 'Brady' },
      ]),
    );

    await render(
      <template>
        {{~#each (sortBy "lastName" "firstName" this.array) as |user|~}}
          {{~user.lastName~}}{{~user.firstName~}}
        {{~/each~}}
      </template>,
    );

    assert
      .dom()
      .hasText(
        'AbramsWilliamBradyDonnieCodaAdamJonesBillyJonesSam',
        'Names are sorted alphabetically by last name then first name',
      );
  });

  test('It accepts a function sort property', async function (assert) {
    this.set('array', emberArray([{ name: 'c' }, { name: 'a' }, { name: 'b' }]));

    this.set('sortBy', (a, b) => {
      if (a.name > b.name) {
        return 1;
      } else if (a.name < b.name) {
        return -1;
      }

      return 0;
    });

    await render(
      <template>
        {{~#each (sortBy this.sortBy this.array) as |user|~}}
          {{~user.name~}}
        {{~/each~}}
      </template>,
    );

    assert.dom().hasText('abc', 'cab is sorted to abc');
  });

  test('it allows null array', async function (assert) {
    this.set('array', null);
    this.set('text', 'this is all that will render');
    await render(
      <template>
        {{this.text}}
        {{#each (sortBy "name" this.array) as |value|}}
          {{value}}
        {{/each}}
      </template>,
    );

    assert.dom().hasText('this is all that will render', 'no error is thrown');
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
        {{~#each (sortBy "firstName" this.users) as |user|~}}
          {{~user.firstName~}}
        {{~/each~}}
      </template>,
    );

    assert.dom().hasText('abc', 'cab is sorted to abc');
  });

  test('it sorts undefined values last', async function (assert) {
    this.set('array', [
      { id: 1, name: 'c' },
      { id: 2, name: 'a' },
      { id: 3, name: undefined },
      { id: 4, name: 'b' },
    ]);

    await render(
      <template>
        {{~#each (sortBy "name" this.array) as |user|~}}
          {{~user.id~}}
        {{~/each~}}
      </template>,
    );

    assert.dom().hasText('2413');
  });

  test('it sorts null values last', async function (assert) {
    this.set('array', [
      { id: 1, name: 'c' },
      { id: 2, name: 'a' },
      { id: 3, name: null },
      { id: 4, name: 'b' },
    ]);

    await render(
      <template>
        {{~#each (sortBy "name" this.array) as |user|~}}
          {{~user.id~}}
        {{~/each~}}
      </template>,
    );

    assert.dom().hasText('2413');
  });

  test('It maintains order when values are the same', async function (assert) {
    this.set('array', [
      { id: 1, name: 'a' },
      { id: 2, name: 'a' },
      { id: 3, name: 'a' },
    ]);

    await render(
      <template>
        {{~#each (sortBy "name" this.array) as |user|~}}
          {{~user.id~}}
        {{~/each~}}
      </template>,
    );

    assert.dom().hasText('123');
  });

  test('it support undefined array values', async function (assert) {
    this.set('array', [
      { id: 1, name: 'c' },
      { id: 2, name: 'a' },
      undefined,
      { id: 4, name: 'b' },
    ]);

    await render(
      <template>
        {{~#each (sortBy "name" this.array) as |user|~}}
          {{~user.id~}}
        {{~/each~}}
      </template>,
    );

    assert.dom().hasText('241');
  });

  test('it support null array values', async function (assert) {
    this.set('array', [{ id: 1, name: 'c' }, { id: 2, name: 'a' }, null, { id: 4, name: 'b' }]);

    await render(
      <template>
        {{~#each (sortBy "name" this.array) as |user|~}}
          {{~user.id~}}
        {{~/each~}}
      </template>,
    );

    assert.dom().hasText('241');
  });

  test('it sorts asc by a few params some of those are all null', async function (assert) {
    this.set('array', [
      { creationDate: null, attrs: { trialNumber: '00-01' }, localOrder: 1 },
      { creationDate: null, attrs: { trialNumber: '00-02' }, localOrder: 2 },
    ]);

    await render(
      <template>
        {{~#each
          (sortBy "creationDate:asc" "attrs.trialNumber:asc" "localOrder" this.array)
          as |trial|
        ~}}
          {{~trial.attrs.trialNumber~}}
        {{~/each~}}
      </template>,
    );

    assert.dom().hasText('00-0100-02');
  });

  test('it sorts desc by a few params some of those are all null', async function (assert) {
    this.set('array', [
      { creationDate: null, attrs: { trialNumber: '00-02' }, localOrder: 1 },
      { creationDate: null, attrs: { trialNumber: '00-01' }, localOrder: 2 },
    ]);

    await render(
      <template>
        {{~#each
          (sortBy "creationDate:desc" "attrs.trialNumber:desc" "localOrder" this.array)
          as |trial|
        ~}}
          {{~trial.attrs.trialNumber~}}
        {{~/each~}}
      </template>,
    );

    assert.dom().hasText('00-0200-01');
  });
});
