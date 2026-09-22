import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMSW } from 'frontend/tests/msw';
import { component } from 'frontend/tests/pages/components/course/publicationcheck';
import Publicationcheck from 'frontend/components/course/publicationcheck';

module('Integration | Component | course/publicationcheck', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  test('it shows unlink icon', async function (assert) {
    const programYearObjective = await this.server.create('program-year-objective');
    const course = await this.server.create('course');
    await this.server.create('course-objective', {
      course,
      programYearObjectives: [programYearObjective],
    });
    await this.server.create('course-objective', { course });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('model', courseModel);
    await render(<template><Publicationcheck @course={{this.model}} /></template>);
    assert.ok(component.unlink.isPresent);
  });

  test('it does not shows unlink icon', async function (assert) {
    const programYearObjective = await this.server.create('program-year-objective');
    const course = await this.server.create('course');
    await this.server.create('course-objective', {
      course,
      programYearObjectives: [programYearObjective],
    });
    await this.server.create('course-objective', {
      course,
      programYearObjectives: [programYearObjective],
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('model', courseModel);
    await render(<template><Publicationcheck @course={{this.model}} /></template>);
    assert.notOk(component.unlink.isPresent);
  });
});
