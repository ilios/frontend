import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import SubjectDescription from 'frontend/components/reports/subject-description';

module('Integration | Component | reports/subject-description', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    const description = 'Salted Carmel Sunday and Sea Lions By the Sea Shore';
    this.set('description', description);
    await render(<template><SubjectDescription @description={{this.description}} /></template>);

    assert.dom().hasText(description);
  });
});
