import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';

const { RSVP, Object } = Ember;
const { resolve } = RSVP;

moduleForComponent('programyear-objective-list', 'Integration | Component | programyear objective list', {
  integration: true
});

test('No table is rendered on empty list', function(assert){
  assert.expect(2);
  let programYear = Object.create({
    objectives: resolve([]),
  });
  this.set('programYear', programYear);
  this.render(hbs`{{programyear-objective-list programYear=programYear}}`);
  return wait().then(() => {
    let container = this.$('.programyear-objective-list');
    assert.equal(container.length, 1, 'Component container element exists.');
    assert.equal(container.text().trim(), '', 'No content is shown.');
  });
});
