import EmberObject from '@ember/object';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click, find, findAll, fillIn, triggerEvent } from '@ember/test-helpers';
import { module, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | curriculum inventory sequence block min max editor', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    let block = EmberObject.create({
      minimum: 5,
      maximum: 10,
    });
    this.set('sequenceBlock', block);
    await render(hbs`{{curriculum-inventory-sequence-block-min-max-editor sequenceBlock=sequenceBlock}}`);
    assert.equal(find('.minimum label').textContent.trim(), 'Minimum:', 'Minimum is labeled correctly.');
    assert.equal(find('.minimum input').value, block.minimum, 'Minimum input has correct value.');
    assert.equal(find('.maximum label').textContent.trim(), 'Maximum:', 'Maximum input is labeled correctly.');
    assert.equal(find('.maximum input').value, block.maximum, 'Maximum input has correct value.');
    assert.equal(findAll('.buttons .done').length, 1, 'Done button is present.');
    assert.equal(findAll('.buttons .cancel').length, 1, 'Cancel button is present.');
  });

  test('save', async function(assert) {
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
    await render(hbs`{{curriculum-inventory-sequence-block-min-max-editor sequenceBlock=block save=saveAction}}`);
    await fillIn('.minimum input', newMinimum);
    await triggerEvent('.minimum input', 'input');
    await fillIn('.maximum input', newMaximum);
    await triggerEvent('.maximum input', 'input');
    await click('.buttons .done');
  });

  test('cancel', async function(assert) {
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
    await render(hbs`{{curriculum-inventory-sequence-block-min-max-editor sequenceBlock=block cancel=cancelAction}}`);
    await click('.buttons .cancel');
  });

  test('save fails when minimum is larger than maximum', async function(assert) {
    assert.expect(2);
    let block = EmberObject.create();
    let saveAction = function() {
      assert.ok(false, 'Save action should have not been invoked.');
    };
    this.set('block', block);
    this.set('saveAction', saveAction);
    await render(hbs`{{curriculum-inventory-sequence-block-min-max-editor sequenceBlock=block save=saveAction}}`);
    assert.equal(findAll('.validation-error-message').length, 0, 'No initial validation errors.');
    await fillIn('.minimum input', '100');
    await triggerEvent('.minimum input', 'input');
    await fillIn('.maximum input', '50');
    await triggerEvent('.maximum input', 'input');
    await click('.buttons .done');
    return settled().then(() => {
      assert.ok(findAll('.validation-error-message').length, 1, 'Validation error shows.');
    });
  });

  test('save fails when minimum is less than zero', async function(assert) {
    assert.expect(2);
    let block = EmberObject.create();
    let saveAction = function() {
      assert.ok(false, 'Save action should have not been invoked.');
    };
    this.set('block', block);
    this.set('saveAction', saveAction);
    await render(hbs`{{curriculum-inventory-sequence-block-min-max-editor sequenceBlock=block save=saveAction}}`);
    assert.equal(findAll('.validation-error-message').length, 0, 'No initial validation errors.');
    await fillIn('.minimum input', '-1');
    await triggerEvent('.minimum input', 'input');
    await fillIn('.maximum input', '50');
    await triggerEvent('.maximum input', 'input');
    await click('.buttons .done');
    return settled().then(() => {
      assert.ok(findAll('.validation-error-message').length, 1, 'Validation error shows.');
    });
  });

  test('save fails when minimum is empty', async function(assert) {
    assert.expect(2);
    let block = EmberObject.create();
    let saveAction = function() {
      assert.ok(false, 'Save action should have not been invoked.');
    };
    this.set('block', block);
    this.set('saveAction', saveAction);
    await render(hbs`{{curriculum-inventory-sequence-block-min-max-editor sequenceBlock=block save=saveAction}}`);
    assert.equal(findAll('.validation-error-message').length, 0, 'No initial validation errors.');
    await fillIn('.minimum input', '');
    await triggerEvent('.minimum input', 'input');
    await fillIn('.maximum input', '50');
    await triggerEvent('.maximum input', 'input');
    await click('.buttons .done');
    return settled().then(() => {
      assert.ok(findAll('.validation-error-message').length, 1, 'Validation error shows.');
    });
  });

  test('save fails when maximum is empty', async function(assert) {
    assert.expect(2);
    let block = EmberObject.create();
    let saveAction = function() {
      assert.ok(false, 'Save action should have not been invoked.');
    };
    this.set('block', block);
    this.set('saveAction', saveAction);
    await render(hbs`{{curriculum-inventory-sequence-block-min-max-editor sequenceBlock=block save=saveAction}}`);
    assert.equal(findAll('.validation-error-message').length, 0, 'No initial validation errors.');
    await fillIn('.minimum input', '0');
    await triggerEvent('.minimum input', 'input');
    await fillIn('.maximum input', '');
    await triggerEvent('.maximum input', 'input');
    await click('.buttons .done');
    return settled().then(() => {
      assert.ok(findAll('.validation-error-message').length, 1, 'Validation error shows.');
    });
  });
});
