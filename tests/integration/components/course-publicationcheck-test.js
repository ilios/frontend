import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | course-publicationcheck', function(hooks) {
  setupRenderingTest(hooks);

  const parent = EmberObject.create();
  const objective1 = EmberObject.create({ parents: [parent] });

  test('it shows unlink icon', async function(assert) {
    const objective2 = EmberObject.create({ parents: [] });
    const course = EmberObject.create({
      objectives: [objective1, objective2]
    });
    this.set('model', course);
    await render(hbs`<CoursePublicationcheck @course={{model}} />`);
    assert.ok(!!find('.fa-unlink'));
  });

  test('it does not shows unlink icon', async function(assert) {
    const objective2 = EmberObject.create({ parents: [parent] });
    const course = EmberObject.create({
      objectives: [objective1, objective2]
    });
    this.set('model', course);
    await render(hbs`<CoursePublicationcheck @course={{model}} />`);
    assert.notOk(!!find('.fa-unlink'));
  });
});
