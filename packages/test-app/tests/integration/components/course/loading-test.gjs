import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMSW } from 'ilios-common/msw';
import Loading from 'ilios-common/components/course/loading';

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
    assert.dom('div').hasAttribute('aria-hidden', 'true');
    assert.dom('.header').exists();
  });
});
