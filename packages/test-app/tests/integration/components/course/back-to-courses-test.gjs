import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import BackToCourses from 'ilios-common/components/course/back-to-courses';

module('Integration | Component | course/back-to-courses', function (hooks) {
  setupRenderingTest(hooks);

  // @todo figure out how to add a courses route so we can test [JJ 2022/6/9]
  test('it renders', async function (assert) {
    await render(<template><BackToCourses /></template>);

    assert.dom(this.element).hasText('');
  });
});
