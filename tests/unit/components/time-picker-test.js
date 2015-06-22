/* global moment */
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('time-picker', 'Unit | Component | time picker', {
  // Specify the other units  that are required for this test
  // needs: ['helper:is-equal'],
  integration: true
});

test('it renders', function(assert) {
  assert.expect(4);

  let today = moment();
  let date = today.toDate();
  this.set('date', date);
  this.render(hbs`{{time-picker date=date}}`);

  let selects = this.$('select');
  assert.equal(selects.length, 3);
  assert.equal($(selects[0]).val(), today.format('h'));
  assert.equal($(selects[1]).val(), today.format('mm'));
  assert.equal($(selects[2]).val(), today.format('a'));
});
