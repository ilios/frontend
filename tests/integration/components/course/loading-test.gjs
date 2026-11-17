import { render } from '@ember/test-helpers';
import Loading from 'frontend/components/course/loading';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { setupMSW } from 'frontend/tests/msw';
import { module, test } from 'qunit';

module('Integration | Component | course/loading', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  test('it renders', async function (assert) {
    const school = await this.server.create('school');
    const course = await this.server.create('course', {
      school,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);

    await render(<template><Loading @course={{this.course}} /></template>);
    assert.dom('[data-test-course-loading]').hasAttribute('aria-hidden', 'true');
    assert.dom('[data-test-course-loading] .header').exists();
  });
});
