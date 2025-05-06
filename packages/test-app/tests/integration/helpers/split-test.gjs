import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import split from 'ilios-common/helpers/split';

module('Integration | Helper | split', function (hooks) {
  setupRenderingTest(hooks);
  test('it splits', async function (assert) {
    await render(
      <template>
        {{#each (split "," "a,b,c") as |l|}}
          <span>{{l}}</span>
        {{/each}}
      </template>,
    );
    assert.dom('span').exists({ count: 3 });
    assert.dom('span:nth-of-type(1)').containsText('a');
    assert.dom('span:nth-of-type(2)').containsText('b');
    assert.dom('span:nth-of-type(3)').containsText('c');
  });

  test('empty value gets empty array', async function (assert) {
    await render(<template>{{split "," ""}}</template>);

    assert.dom('span').doesNotExist();
  });
});
