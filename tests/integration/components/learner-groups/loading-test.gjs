import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import Loading from 'frontend/components/learner-groups/loading';

module('Integration | Component | learner-groups/loading', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders', async function (assert) {
    await render(<template><Loading @count={{2}} /></template>);
    assert.dom('tbody tr').exists({ count: 2 });
    await a11yAudit(this.element);
  });
});
