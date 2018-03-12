import { run } from '@ember/runloop';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

import wait from 'ember-test-helpers/wait';

moduleForComponent('search-box', 'Integration | Component | search box', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{search-box}}`);

  assert.equal(this.$('input[type=search]').length, 1);
});

test('clicking search calls search', function(assert) {
  this.on('search', function(value){
    assert.equal(value, '');
  });
  this.render(hbs`{{search-box search=(action 'search')}}`);
  const searchBoxIcon = '.search-icon';
  this.$(searchBoxIcon).click();

  return wait();
});

test('typing calls search', function(assert) {
  this.on('search', function(value){
    assert.equal(value, 'typed it');
  });
  this.render(hbs`{{search-box search=(action 'search')}}`);
  run(() => {
    this.$('input').val('typed it');
    this.$('input').trigger('input');
    this.$('input').trigger('keyup', {which: 50});
  });
  //wait for debounce timer in component
  return wait();
});

test('escape calls clear', function(assert) {
  this.on('clear', function(){
    assert.ok(true);
  });
  this.on('search', parseInt);
  this.render(hbs`{{search-box search=(action 'search') clear=(action 'clear')}}`);
  run(() => {
    this.$('input').val('typed it');
    this.$('input').trigger('change');
    this.$('input').trigger($.Event('keyup', { keyCode: 27 }));
  });
});
