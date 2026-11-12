import { render } from '@ember/test-helpers';
import BackToCourses from 'frontend/components/course/back-to-courses';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { component } from 'frontend/tests/pages/components/course/back-to-courses';
import { module, test } from 'qunit';

module('Integration | Component | course/back-to-courses', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><BackToCourses /></template>);
    assert.strictEqual(component.text, 'Back to Courses List');
  });
});
