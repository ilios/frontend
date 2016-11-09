import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';

const { RSVP, Object } = Ember;
const { resolve } = RSVP;

moduleForComponent('session-objective-list', 'Integration | Component | session objective list', {
  integration: true
});

test('No table is rendered on empty list', function(assert){
  assert.expect(2);
  let session = Object.create({
    objectives: resolve([]),
  });
  this.set('session', session);
  this.render(hbs`{{session-objective-list session=session}}`);
  return wait().then(() => {
    let container = this.$('.session-objective-list');
    assert.equal(container.length, 1, 'Component container element exists.');
    assert.equal(container.text().trim(), '', 'No content is shown.');
  });
});
