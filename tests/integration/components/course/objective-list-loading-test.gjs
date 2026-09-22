import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import ObjectiveListLoading from 'frontend/components/course/objective-list-loading';

module('Integration | Component | course/objective-list-loading', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><ObjectiveListLoading @count={{9}} @showMeSH={{true}} /></template>);

    assert.dom('.grid-row').exists({ count: 9 });
    assert.dom('.grid-item').exists({ count: 9 * 4 });
  });

  test('it renders without MeSH UI', async function (assert) {
    await render(<template><ObjectiveListLoading @count={{9}} @showMeSH={{false}} /></template>);

    assert.dom('.grid-row').exists({ count: 9 });
    assert.dom('.grid-item').exists({ count: 9 * 3 });
  });
});
