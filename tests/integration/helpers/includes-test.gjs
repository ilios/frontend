// taken from Ember Composable Helpers (https://github.com/DockYard/ember-composable-helpers), then modified.

import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import includes from 'ilios-common/helpers/includes';

module('Integration | Helper | includes', function (hooks) {
  setupRenderingTest(hooks);

  test('it checks if an array includes a primitive value', async function (assert) {
    this.set('items', ['foo', 'bar', 'baz']);

    await render(<template>{{includes "foo" this.items}}</template>);

    assert.dom().hasText('true', 'should render true');
  });

  test('it checks if an array includes a non-primitive value', async function (assert) {
    let games = [{ name: 'Firewatch' }, { name: 'Rocket League' }, { name: 'CSGO' }];
    this.set('selectedGame', games[0]);
    this.set('wishlist', games);

    await render(<template>{{includes this.selectedGame this.wishlist}}</template>);

    assert.dom().hasText('true', 'should render true');
  });

  test('it checks if an array includes an array of primitive values', async function (assert) {
    this.set('items', ['foo', 'bar', 'baz', undefined, null]);
    this.set('selectedItems', ['foo', 'bar', undefined, null]);

    await render(<template>{{includes this.selectedItems this.items}}</template>);

    assert.dom().hasText('true', 'should render true');
  });

  test('it watches for changes', async function (assert) {
    let games = [{ name: 'Firewatch' }, { name: 'Rocket League' }, { name: 'CSGO' }];
    this.set('selectedGame', games[0]);
    this.set('wishlist', games);

    await render(<template>{{includes this.selectedGame this.wishlist}}</template>);

    assert.dom().hasText('true', 'should render true');

    this.set(
      'wishlist',
      games.filter((g) => g !== games[0]),
    );

    assert.dom().hasText('false', 'should render false');

    // eslint-disable-next-line ember/no-runloop
    run(() => this.set('selectedGame', games[1]));

    assert.dom().hasText('true', 'should render true');
  });

  test('it allows null array', async function (assert) {
    this.set('array', null);
    this.set('text', 'this is all that will render');

    await render(
      <template>
        {{this.text}}
        {{~#each (includes 1 this.array) as |val|~}}
          {{val}}
        {{~/each~}}
      </template>,
    );

    assert.dom().hasText('this is all that will render', 'no error is thrown');
  });

  test('it allows undefined array', async function (assert) {
    this.set('array', undefined);
    this.set('text', 'this is all that will render');

    await render(
      <template>
        {{this.text}}
        {{~#each (includes 1 this.array) as |val|~}}
          {{val}}
        {{~/each~}}
      </template>,
    );

    assert.dom().hasText('this is all that will render', 'no error is thrown');
  });
});
