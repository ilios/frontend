// taken from Ember Composable Helpers (https://github.com/DockYard/ember-composable-helpers), then modified.
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';

module('Integration | Helper | repeat', function (hooks) {
  setupRenderingTest(hooks);

  test('it repeats `n` times', async function (assert) {
    this.set('value', '1');
    await render(hbs`{{~#each (repeat 3)~}}
  {{this.value}}
{{~/each~}}`);

    assert.dom().hasText('111', 'should repeat 3 times');
  });

  test('it repeats `n` times with a value', async function (assert) {
    this.set('person', { name: 'Adam' });
    await render(hbs`{{~#each (repeat 3 this.person) as |person|~}}
  {{~person.name~}}
{{~/each~}}`);

    assert.dom().hasText('AdamAdamAdam', 'should repeat 3 times with a value');
  });
});
