import { render } from '@ember/test-helpers';
import SubjectDescription from 'frontend/components/reports/subject-description';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { module, test } from 'qunit';

module('Integration | Component | reports/subject-description', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    const description = 'Salted Carmel Sunday and Sea Lions By the Sea Shore';
    this.set('description', description);
    await render(<template><SubjectDescription @description={{this.description}} /></template>);

    assert.dom().hasText(description);
  });
});
