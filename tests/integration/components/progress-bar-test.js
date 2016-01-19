import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('progress-bar', 'Integration | Component | progress bar', {
  integration: true
});

test('it renders at default 0%', function(assert) {
  this.render(hbs`{{progress-bar}}`);

  assert.equal(this.$().text().trim(), '0%');
});

test('changing percentage changes width', function(assert) {
  
  this.set('passedValue', 42);
  
  this.render(hbs`{{progress-bar percentage=passedValue}}`);

  assert.equal(this.$('.meter').attr('style').trim(), 'width: 42%');
  
  this.set('passedValue', 12);
  assert.equal(this.$('.meter').attr('style').trim(), 'width: 12%');
});

test('changing percentage changes the displayvalue', function(assert) {
  
  this.set('passedValue', 42);
  
  this.render(hbs`{{progress-bar percentage=passedValue}}`);

  assert.equal(this.$().text().trim(), '42%');
  
  this.set('passedValue', 11);
  assert.equal(this.$().text().trim(), '11%');
  
});
