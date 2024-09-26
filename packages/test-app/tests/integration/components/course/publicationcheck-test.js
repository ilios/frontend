import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { component } from 'ilios-common/page-objects/components/course/publicationcheck';

module('Integration | Component | course/publicationcheck', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it shows unlink icon', async function (assert) {
    const programYearObjective = this.server.create('program-year-objective');
    const course = this.server.create('course');
    this.server.create('course-objective', {
      course,
      programYearObjectives: [programYearObjective],
    });
    this.server.create('course-objective', { course });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('model', courseModel);
    await render(hbs`<Course::Publicationcheck @course={{this.model}} />`);
    assert.ok(component.unlink.isPresent);
  });

  test('it does not shows unlink icon', async function (assert) {
    const programYearObjective = this.server.create('program-year-objective');
    const course = this.server.create('course');
    this.server.create('course-objective', {
      course,
      programYearObjectives: [programYearObjective],
    });
    this.server.create('course-objective', {
      course,
      programYearObjectives: [programYearObjective],
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('model', courseModel);
    await render(hbs`<Course::Publicationcheck @course={{this.model}} />`);
    assert.notOk(component.unlink.isPresent);
  });
});
