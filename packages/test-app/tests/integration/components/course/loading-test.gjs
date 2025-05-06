import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import Loading from 'ilios-common/components/course/loading';

module('Integration | Component | course/loading', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const school = this.server.create('school');
    const course = this.server.create('course', {
      school,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);

    await render(<template><Loading @course={{this.course}} /></template>);
    assert.dom('div').hasAttribute('aria-hidden', 'true');
    assert.dom('.header').exists();
  });
});
