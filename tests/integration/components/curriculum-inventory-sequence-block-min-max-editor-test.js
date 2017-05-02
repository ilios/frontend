import Ember from 'ember';
import { moduleForComponent } from 'ember-qunit';
import { test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

const { Object:EmberObject } = Ember;

moduleForComponent('curriculum-inventory-sequence-block-min-max-editor', 'Integration | Component | curriculum inventory sequence block min max editor', {
  integration: true
});

test('it renders', function(assert) {
  let block = EmberObject.create({
    minimum: 5,
    maximum: 10,
  });
  this.set('sequenceBlock', block);
  this.render(hbs`{{curriculum-inventory-sequence-block-min-max-editor sequenceBlock=sequenceBlock}}`);
  assert.equal(this.$('.minimum label').text().trim(), 'Minimum:', 'Minimum is labeled correctly.');
  assert.equal(this.$('.minimum input').val(), block.minimum, 'Minimum input has correct value.');
  assert.equal(this.$('.maximum label').text().trim(), 'Maximum:', 'Maximum input is labeled correctly.');
  assert.equal(this.$('.maximum input').val(), block.maximum, 'Maximum input has correct value.');
  assert.equal(this.$('.buttons .done').length, 1, 'Done button is present.');
  assert.equal(this.$('.buttons .cancel').length, 1, 'Cancel button is present.');
});

test('save', function(assert) {
  assert.expect(2);
  const newMinimum = '50';
  const newMaximum = '100';
  let block = EmberObject.create({
    minimum: 5,
    maximum: 10
  });
  let saveAction = function(min, max) {
    assert.equal(min, newMinimum, 'New minimum got passed to save action.');
    assert.equal(max, newMaximum, 'New maximum got passed to save action.');
  };
  this.set('block', block);
  this.set('saveAction', saveAction);
  this.render(hbs`{{curriculum-inventory-sequence-block-min-max-editor sequenceBlock=block save=saveAction}}`);
  this.$('.minimum input').val(newMinimum);
  this.$('.minimum input').trigger('change');
  this.$('.maximum input').val(newMaximum);
  this.$('.maximum input').trigger('change');
  this.$('.buttons .done').click();
});

test('cancel', function(assert) {
  assert.expect(1);
  let block = EmberObject.create({
    minimum: 5,
    maximum: 10,
  });
  let cancelAction = function() {
    assert.ok(true, 'Cancel action got invoked.');
  };
  this.set('block', block);
  this.set('cancelAction', cancelAction);
  this.render(hbs`{{curriculum-inventory-sequence-block-min-max-editor sequenceBlock=block cancel=cancelAction}}`);
  this.$('.buttons .cancel').click();
});

test('save fails when minimum is larger than maximum', function(assert) {
  assert.expect(2);
  let block = EmberObject.create();
  let saveAction = function() {
    assert.ok(false, 'Save action should have not been invoked.');
  };
  this.set('block', block);
  this.set('saveAction', saveAction);
  this.render(hbs`{{curriculum-inventory-sequence-block-min-max-editor sequenceBlock=block save=saveAction}}`);
  assert.equal(this.$('.validation-error-message').length, 0, 'No initial validation errors.');
  this.$('.minimum input').val('100');
  this.$('.minimum input').trigger('change');
  this.$('.maximum input').val('50');
  this.$('.maximum input').trigger('change');
  this.$('.buttons .done').click();
  return wait().then(() => {
    assert.ok(this.$('.validation-error-message').length, 1, 'Validation error shows.');
  });
});

test('save fails when minimum is less than zero', function(assert) {
  assert.expect(2);
  let block = EmberObject.create();
  let saveAction = function() {
    assert.ok(false, 'Save action should have not been invoked.');
  };
  this.set('block', block);
  this.set('saveAction', saveAction);
  this.render(hbs`{{curriculum-inventory-sequence-block-min-max-editor sequenceBlock=block save=saveAction}}`);
  assert.equal(this.$('.validation-error-message').length, 0, 'No initial validation errors.');
  this.$('.minimum input').val('-1');
  this.$('.minimum input').trigger('change');
  this.$('.maximum input').val('50');
  this.$('.maximum input').trigger('change');
  this.$('.buttons .done').click();
  return wait().then(() => {
    assert.ok(this.$('.validation-error-message').length, 1, 'Validation error shows.');
  });
});

test('save fails when minimum is empty', function(assert) {
  assert.expect(2);
  let block = EmberObject.create();
  let saveAction = function() {
    assert.ok(false, 'Save action should have not been invoked.');
  };
  this.set('block', block);
  this.set('saveAction', saveAction);
  this.render(hbs`{{curriculum-inventory-sequence-block-min-max-editor sequenceBlock=block save=saveAction}}`);
  assert.equal(this.$('.validation-error-message').length, 0, 'No initial validation errors.');
  this.$('.minimum input').val('');
  this.$('.minimum input').trigger('change');
  this.$('.maximum input').val('50');
  this.$('.maximum input').trigger('change');
  this.$('.buttons .done').click();
  return wait().then(() => {
    assert.ok(this.$('.validation-error-message').length, 1, 'Validation error shows.');
  });
});

test('save fails when maximum is empty', function(assert) {
  assert.expect(2);
  let block = EmberObject.create();
  let saveAction = function() {
    assert.ok(false, 'Save action should have not been invoked.');
  };
  this.set('block', block);
  this.set('saveAction', saveAction);
  this.render(hbs`{{curriculum-inventory-sequence-block-min-max-editor sequenceBlock=block save=saveAction}}`);
  assert.equal(this.$('.validation-error-message').length, 0, 'No initial validation errors.');
  this.$('.minimum input').val('0');
  this.$('.minimum input').trigger('change');
  this.$('.maximum input').val('');
  this.$('.maximum input').trigger('change');
  this.$('.buttons .done').click();
  return wait().then(() => {
    assert.ok(this.$('.validation-error-message').length, 1, 'Validation error shows.');
  });
});
