import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | split', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  test('it splits', async function (assert) {
    await render(hbs`
    {{#each (split "," "a,b,c") as |l|}}
      <span>{{l}}</span>
    {{/each}}
    
`);
    assert.dom('span').exists({ count: 3 });
    assert.dom('span:nth-of-type(1)').containsText('a');
    assert.dom('span:nth-of-type(2)').containsText('b');
    assert.dom('span:nth-of-type(3)').containsText('c');
  });

  test('empty value gets empty array', async function (assert) {
    await render(hbs`{{split "," ""}}
`);

    assert.dom('span').doesNotExist();
  });
});
