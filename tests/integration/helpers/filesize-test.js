
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('filesize', 'helper:filesize', {
  integration: true
});

test('it bytes', function(assert) {
  this.set('inputValue', '42');

  this.render(hbs`{{filesize inputValue}}`);

  assert.equal(this.$().text().trim(), '42b');
});

test('it kilobytes', function(assert) {
  this.set('inputValue', '4200');

  this.render(hbs`{{filesize inputValue}}`);

  assert.equal(this.$().text().trim(), '4kb');
});

test('it megabytes', function(assert) {
  this.set('inputValue', '4200000');

  this.render(hbs`{{filesize inputValue}}`);

  assert.equal(this.$().text().trim(), '4mb');
});
