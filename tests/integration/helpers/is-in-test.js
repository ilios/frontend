
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('is-in', 'helper:is-in', {
  integration: true
});

test('it calculates array membership correctly and updates live', function(assert) {
  this.set('value', '42');
  this.set('array', ['42']);
  this.render(hbs`{{if (is-in array value) 'true' 'false'}}`);

  assert.equal(this.$().text().trim(), 'true');

  this.set('value', 42);
  assert.equal(this.$().text().trim(), 'false');

  this.set('array', [42]);
  assert.equal(this.$().text().trim(), 'true');
  const obj = {};
  this.set('array', [obj]);
  this.set('value', obj);
  assert.equal(this.$().text().trim(), 'true');

  this.set('value', {});
  assert.equal(this.$().text().trim(), 'false');

});
