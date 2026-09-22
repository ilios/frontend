// taken from Ember Composable Helpers (https://github.com/DockYard/ember-composable-helpers), then modified.

import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import repeat from 'ilios-common/helpers/repeat';

module('Integration | Helper | repeat', function (hooks) {
  setupRenderingTest(hooks);

  test('it repeats `n` times', async function (assert) {
    this.set('value', '1');
    await render(
      <template>
        {{~#each (repeat 3)~}}
          {{this.value}}
        {{~/each~}}
      </template>,
    );

    assert.dom().hasText('111', 'should repeat 3 times');
  });

  test('it repeats `n` times with a value', async function (assert) {
    this.set('person', { name: 'Adam' });
    await render(
      <template>
        {{~#each (repeat 3 this.person) as |person|~}}
          {{~person.name~}}
        {{~/each~}}
      </template>,
    );

    assert.dom().hasText('AdamAdamAdam', 'should repeat 3 times with a value');
  });
});
