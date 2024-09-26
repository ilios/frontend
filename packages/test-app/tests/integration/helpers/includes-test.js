// taken from Ember Composable Helpers (https://github.com/DockYard/ember-composable-helpers), then modified.
import { hbs } from 'ember-cli-htmlbars';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';

module('Integration | Helper | includes', function (hooks) {
  setupRenderingTest(hooks);

  test('it checks if an array includes a primitive value', async function (assert) {
    this.set('items', ['foo', 'bar', 'baz']);

    await render(hbs`{{includes 'foo' this.items}}`);

    assert.dom().hasText('true', 'should render true');
  });

  test('it checks if an array includes a non-primitive value', async function (assert) {
    let games = [{ name: 'Firewatch' }, { name: 'Rocket League' }, { name: 'CSGO' }];
    this.set('selectedGame', games[0]);
    this.set('wishlist', games);

    await render(hbs`{{includes this.selectedGame this.wishlist}}`);

    assert.dom().hasText('true', 'should render true');
  });

  test('it checks if an array includes an array of primitive values', async function (assert) {
    this.set('items', ['foo', 'bar', 'baz', undefined, null]);
    this.set('selectedItems', ['foo', 'bar', undefined, null]);

    await render(hbs`{{includes this.selectedItems this.items}}`);

    assert.dom().hasText('true', 'should render true');
  });

  test('it watches for changes', async function (assert) {
    let games = [{ name: 'Firewatch' }, { name: 'Rocket League' }, { name: 'CSGO' }];
    this.set('selectedGame', games[0]);
    this.set('wishlist', games);

    await render(hbs`{{includes this.selectedGame this.wishlist}}`);

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

    await render(hbs`{{this.text}}
{{~#each (includes 1 this.array) as |val|~}}
  {{val}}
{{~/each~}}`);

    assert.dom().hasText('this is all that will render', 'no error is thrown');
  });

  test('it allows undefined array', async function (assert) {
    this.set('array', undefined);
    this.set('text', 'this is all that will render');

    await render(hbs`{{this.text}}
{{~#each (includes 1 this.array) as |val|~}}
  {{val}}
{{~/each~}}`);

    assert.dom().hasText('this is all that will render', 'no error is thrown');
  });
});
