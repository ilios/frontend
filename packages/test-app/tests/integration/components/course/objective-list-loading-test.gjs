import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import ObjectiveListLoading from 'ilios-common/components/course/objective-list-loading';

module('Integration | Component | course/objective-list-loading', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><ObjectiveListLoading @count={{9}} /></template>);

    assert.dom('.grid-row').exists({ count: 9 });
  });
});
