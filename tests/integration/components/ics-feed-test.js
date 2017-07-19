import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('ics-feed', 'Integration | Component | ics feed', {
  integration: true
});

test('it show instructions', function(assert) {
  assert.expect(1);
  let instructions = 'SOME TEST INS';
  this.set('instructions', instructions);

  this.render(hbs`{{ics-feed instructions=instructions}}`);

  assert.equal(this.$().text().trim(), instructions);
});

test('it show url', function(assert) {
  assert.expect(1);
  let url = 'http://example.com/url';
  this.set('url', url);

  this.render(hbs`{{ics-feed url=url}}`);

  assert.equal(this.$('input').val().trim(), url);
});

// test('refresh calls action', function(assert) {
//   assert.expect(1);
//   let url = 'http://example.com/url';
//   this.set('url', url);
//   // Set any properties with this.set('myProperty', 'value');
//   // Handle any actions with this.on('myAction', function(val) { ... });
//   this.on('refresh', function(){
//     assert.ok(true);
//   });
//   this.render(hbs`{{ics-feed refresh='refresh'}}`);
//
//   this.$('button:eq(1)').click();
// });
