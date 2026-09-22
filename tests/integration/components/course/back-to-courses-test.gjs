import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import Service from '@ember/service';
import BackToCourses from 'ilios-common/components/course/back-to-courses';
import { component } from 'ilios-common/page-objects/components/course/back-to-courses';

module('Integration | Component | course/back-to-courses', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders empty if courses route does not exist', async function (assert) {
    await render(<template><BackToCourses /></template>);

    assert.dom(this.element).hasText('');
  });

  test('it renders if courses route does exists', async function (assert) {
    class RouterMock extends Service {
      urlFor() {
        return 'courses';
      }
    }
    this.owner.register('service:router', RouterMock);
    await render(<template><BackToCourses /></template>);
    assert.strictEqual(component.text, 'Back to Courses List');
  });
});
