import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click, findAll, fillIn, find, triggerEvent } from '@ember/test-helpers';
import { module, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;

module('Integration | Component | curriculum inventory sequence block header', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    let block = EmberObject.create({
      title: 'Block title'
    });
    this.set('sequenceBlock', block);
    await render(hbs`{{curriculum-inventory-sequence-block-header sequenceBlock=sequenceBlock}}`);
    assert.equal(find('.title').textContent.trim(), block.title, 'Block title is visible');
    assert.equal(findAll('.editable').length, 1, 'Block title is editable.');
  });

  test('read-only mode for block in finalized report', async function(assert) {
    let block = EmberObject.create({
      title: 'Block title',
      report: {
        isFinalized: true
      }
    });
    this.set('sequenceBlock', block);
    await render(hbs`{{curriculum-inventory-sequence-block-header sequenceBlock=sequenceBlock}}`);
    assert.equal(findAll('.editable').length, 0, 'Block title is not editable.');
  });

  test('change title', async function(assert) {
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
    await render(hbs`{{curriculum-inventory-sequence-block-header sequenceBlock=sequenceBlock}}`);
    assert.equal(find('.editinplace').textContent.trim(), block.title);
    await click('.editable');
    await fillIn('.editinplace input', newTitle);
    await triggerEvent('.editinplace input', 'input');
    await click('.editinplace .done');
    return settled().then(() => {
      assert.equal(find('.editinplace').textContent.trim(), newTitle);
    });
  });

  test('change title fails on empty value', async function(assert) {
    assert.expect(2);
    let block = EmberObject.create({
      title: 'block title',
      save(){
        assert.ok(false, 'Save action should not have been invoked.');
      }
    });
    this.set('sequenceBlock', block);
    await render(hbs`{{curriculum-inventory-sequence-block-header sequenceBlock=sequenceBlock}}`);
    await click('.editable');
    assert.equal(findAll('.validation-error-message').length, 0, 'No validation error shown initially.');
    await fillIn('.editinplace input', '');
    await triggerEvent('.editinplace input', 'input');
    await click('.editinplace .done');
    return settled().then(() => {
      assert.ok(findAll('.validation-error-message').length, 1, 'Validation error shows.');
    });
  });

  test('change title fails on too-short value', async function(assert) {
    assert.expect(2);
    let block = EmberObject.create({
      title: 'block title',
      save(){
        assert.ok(false, 'Save action should not have been invoked.');
      }
    });
    this.set('sequenceBlock', block);
    await render(hbs`{{curriculum-inventory-sequence-block-header sequenceBlock=sequenceBlock}}`);
    await click('.editable');
    assert.equal(findAll('.validation-error-message').length, 0, 'No validation error shown initially.');
    await fillIn('.editinplace input', 'ab');
    await triggerEvent('.editinplace input', 'input');
    await click('.editinplace .done');
    return settled().then(() => {
      assert.ok(findAll('.validation-error-message').length, 1, 'Validation error shows.');
    });
  });

  test('change title fails on overlong value', async function(assert) {
    assert.expect(2);
    let block = EmberObject.create({
      title: 'block title',
      save(){
        assert.ok(false, 'Save action should not have been invoked.');
      }
    });
    this.set('sequenceBlock', block);
    await render(hbs`{{curriculum-inventory-sequence-block-header sequenceBlock=sequenceBlock}}`);
    await click('.editable');
    assert.equal(findAll('.validation-error-message').length, 0, 'No validation error shown initially.');
    await fillIn('.editinplace input', '0123456789'.repeat(21));
    await triggerEvent('.editinplace input', 'input');
    await click('.editinplace .done');
    return settled().then(() => {
      assert.ok(findAll('.validation-error-message').length, 1, 'Validation error shows.');
    });
  });
});
