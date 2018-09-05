import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | visualizer course objectives', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    const course = EmberObject.create({
      title: 'test'
    });
    this.set('course', course);
    await render(hbs`{{visualizer-course-objectives course=course isIcon=true}}`);

    assert.equal(find('*').textContent.trim(), '');
  });
});
