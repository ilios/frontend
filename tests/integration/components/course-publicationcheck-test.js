import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | course-publicationcheck', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it shows unlink icon', async function (assert) {
    const programYearObjective = this.server.create('programYearObjective');
    const course = this.server.create('course');
    this.server.create('courseObjective', {
      course,
      programYearObjectives: [programYearObjective],
    });
    this.server.create('courseObjective', { course });
    const courseModel = await this.owner
      .lookup('service:store')
      .find('course', course.id);
    this.set('model', courseModel);
    await render(hbs`<CoursePublicationcheck @course={{model}} />`);
    assert.ok(!!find('.fa-unlink'));
  });

  test('it does not shows unlink icon', async function (assert) {
    const programYearObjective = this.server.create('programYearObjective');
    const course = this.server.create('course');
    this.server.create('courseObjective', {
      course,
      programYearObjectives: [programYearObjective],
    });
    this.server.create('courseObjective', {
      course,
      programYearObjectives: [programYearObjective],
    });
    const courseModel = await this.owner
      .lookup('service:store')
      .find('course', course.id);
    this.set('model', courseModel);
    await render(hbs`<CoursePublicationcheck @course={{model}} />`);
    assert.notOk(!!find('.fa-unlink'));
  });
});
