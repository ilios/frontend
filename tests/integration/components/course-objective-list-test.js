import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';

const { RSVP, Object } = Ember;
const { resolve } = RSVP;

moduleForComponent('course-objective-list', 'Integration | Component | course objective list', {
  integration: true
});

test('No table is rendered on empty list', function(assert){
  assert.expect(2);
  let course = Object.create({
    objectives: resolve([]),
  });
  this.set('course', course);
  this.render(hbs`{{course-objective-list course=course}}`);
  return wait().then(() => {
    let container = this.$('.course-objective-list');
    assert.equal(container.length, 1, 'Component container element exists.');
    assert.equal(container.text().trim(), '', 'No content is shown.');
  });
});
