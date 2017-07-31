import EmberObject from '@ember/object';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('visualizer-course-objectives', 'Integration | Component | visualizer course objectives', {
  integration: true
});

test('it renders', function(assert) {
  const course = EmberObject.create({
    title: 'test'
  });
  this.set('course', course);
  this.render(hbs`{{visualizer-course-objectives course=course icon=true}}`);

  assert.equal(this.$().text().trim(), '');
});
