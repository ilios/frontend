import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/course-publicationcheck';

module('Integration | Component | course-publicationcheck', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it shows unlink icon', async function (assert) {
    const programYearObjective = this.server.create('programYearObjective');
    const course = this.server.create('course');
    this.server.create('courseObjective', {
      course,
      programYearObjectives: [programYearObjective],
    });
    this.server.create('courseObjective', { course });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('model', courseModel);
    await render(hbs`<CoursePublicationcheck @course={{this.model}} />
`);
    assert.ok(component.unlink.isPresent);
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
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('model', courseModel);
    await render(hbs`<CoursePublicationcheck @course={{this.model}} />
`);
    assert.notOk(component.unlink.isPresent);
  });
});
