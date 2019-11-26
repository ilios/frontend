import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | course-publicationcheck', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it shows unlink icon', async function (assert) {
    const parent = this.server.create('objective');
    const objectiveWithParent = this.server.create('objective', { parents: [parent] });
    const objectiveWithoutParent = this.server.create('objective');
    const course = this.server.create('course', {
      objectives: [objectiveWithParent, objectiveWithoutParent]
    });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    this.set('model', courseModel);
    await render(hbs`<CoursePublicationcheck @course={{model}} />`);
    assert.ok(!!find('.fa-unlink'));
  });

  test('it does not shows unlink icon', async function(assert) {
    const parent = this.server.create('objective');
    const objectives = this.server.createList('objective', 2, { parents: [parent] });
    const course = this.server.create('course', { objectives });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    this.set('model', courseModel);
    await render(hbs`<CoursePublicationcheck @course={{model}} />`);
    assert.notOk(!!find('.fa-unlink'));
  });
});
