import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('ics-feed', 'Integration | Component | ics feed', {
  integration: true
});

test('it show instructions', function(assert) {
  assert.expect(1);
  const instructions = 'SOME TEST INS';
  const element = 'p:eq(0)';
  this.set('instructions', instructions);

  this.render(hbs`{{ics-feed instructions=instructions}}`);

  assert.equal(this.$(element).text().trim(), instructions);
});
