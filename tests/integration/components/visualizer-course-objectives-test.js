import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

const { Object } = Ember;

moduleForComponent('visualizer-course-objectives', 'Integration | Component | visualizer course objectives', {
  integration: true
});

test('it renders', function(assert) {
  const course = Object.create({
    title: 'test'
  });
  this.set('course', course);
  this.render(hbs`{{visualizer-course-objectives course=course}}`);

  assert.equal(this.$().text().trim(), '');
});
