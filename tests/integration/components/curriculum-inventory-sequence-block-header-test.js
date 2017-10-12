import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import { moduleForComponent } from 'ember-qunit';
import { test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

const { resolve } = RSVP;

moduleForComponent('curriculum-inventory-sequence-block-header', 'Integration | Component | curriculum inventory sequence block header', {
  integration: true
});

test('it renders', function(assert) {
  let block = EmberObject.create({
    title: 'Block title'
  });
  this.set('sequenceBlock', block);
  this.render(hbs`{{curriculum-inventory-sequence-block-header sequenceBlock=sequenceBlock}}`);
  assert.equal(this.$('.title').text().trim(), block.title, 'Block title is visible');
  assert.equal(this.$('.editable').length, 1, 'Block title is editable.');
});

test('read-only mode for block in finalized report', function(assert) {
  let block = EmberObject.create({
    title: 'Block title',
    report: {
      isFinalized: true
    }
  });
  this.set('sequenceBlock', block);
  this.render(hbs`{{curriculum-inventory-sequence-block-header sequenceBlock=sequenceBlock}}`);
  assert.equal(this.$('.editable').length, 0, 'Block title is not editable.');
});

test('change title', function(assert) {
  assert.expect(3);
  const newTitle = 'new title';
  let block = EmberObject.create({
    title: 'block title',
    save(){
      assert.equal(this.get('title'), newTitle);
      return resolve(this);
    }
  });
  this.set('sequenceBlock', block);
  this.render(hbs`{{curriculum-inventory-sequence-block-header sequenceBlock=sequenceBlock}}`);
  assert.equal(this.$('.editinplace').text().trim(), block.title);
  this.$('.editable').click();
  this.$('.editinplace input').val(newTitle);
  this.$('.editinplace input').trigger('change');
  this.$('.editinplace .done').click();
  return wait().then(() => {
    assert.equal(this.$('.editinplace').text().trim(), newTitle);
  });
});

test('change title fails on empty value', function(assert) {
  assert.expect(2);
  let block = EmberObject.create({
    title: 'block title',
    save(){
      assert.ok(false, 'Save action should not have been invoked.');
    }
  });
  this.set('sequenceBlock', block);
  this.render(hbs`{{curriculum-inventory-sequence-block-header sequenceBlock=sequenceBlock}}`);
  this.$('.editable').click();
  assert.equal(this.$('.validation-error-message').length, 0, 'No validation error shown initially.');
  this.$('.editinplace input').val('');
  this.$('.editinplace input').trigger('change');
  this.$('.editinplace .done').click();
  return wait().then(() => {
    assert.ok(this.$('.validation-error-message').length, 1, 'Validation error shows.');
  });
});

test('change title fails on too-short value', function(assert) {
  assert.expect(2);
  let block = EmberObject.create({
    title: 'block title',
    save(){
      assert.ok(false, 'Save action should not have been invoked.');
    }
  });
  this.set('sequenceBlock', block);
  this.render(hbs`{{curriculum-inventory-sequence-block-header sequenceBlock=sequenceBlock}}`);
  this.$('.editable').click();
  assert.equal(this.$('.validation-error-message').length, 0, 'No validation error shown initially.');
  this.$('.editinplace input').val('ab');
  this.$('.editinplace input').trigger('change');
  this.$('.editinplace .done').click();
  return wait().then(() => {
    assert.ok(this.$('.validation-error-message').length, 1, 'Validation error shows.');
  });
});

test('change title fails on overlong value', function(assert) {
  assert.expect(2);
  let block = EmberObject.create({
    title: 'block title',
    save(){
      assert.ok(false, 'Save action should not have been invoked.');
    }
  });
  this.set('sequenceBlock', block);
  this.render(hbs`{{curriculum-inventory-sequence-block-header sequenceBlock=sequenceBlock}}`);
  this.$('.editable').click();
  assert.equal(this.$('.validation-error-message').length, 0, 'No validation error shown initially.');
  this.$('.editinplace input').val('0123456789'.repeat(21));
  this.$('.editinplace input').trigger('change');
  this.$('.editinplace .done').click();
  return wait().then(() => {
    assert.ok(this.$('.validation-error-message').length, 1, 'Validation error shows.');
  });
});
