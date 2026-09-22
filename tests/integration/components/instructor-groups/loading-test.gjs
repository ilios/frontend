import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import Loading from 'frontend/components/instructor-groups/loading';

module('Integration | Component | instructor-groups/loading', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><Loading @count={{4}} /></template>);
    assert.dom('tbody tr').exists({ count: 4 });
    await a11yAudit(this.element);
  });
});
