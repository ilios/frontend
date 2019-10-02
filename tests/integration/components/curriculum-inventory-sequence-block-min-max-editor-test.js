import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  settled,
  click,
  findAll,
  fillIn,
  triggerEvent
} from '@ember/test-helpers';
import { module, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | curriculum inventory sequence block min max editor', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    const minimum = '5';
    const maximum = '10';
    this.set('minimum', minimum);
    this.set('maximum', maximum);
    await render(hbs`<CurriculumInventorySequenceBlockMinMaxEditor
      @minimum={{minimum}}
      @maximum={{maximum}}
    />`);
    assert.dom('.minimum label').hasText('Minimum:', 'Minimum is labeled correctly.');
    assert.dom('.minimum input').hasValue(minimum, 'Minimum input has correct value.');
    assert.dom('.maximum label').hasText('Maximum:', 'Maximum input is labeled correctly.');
    assert.dom('.maximum input').hasValue(maximum, 'Maximum input has correct value.');
    assert.dom('.buttons .done').exists({ count: 1 }, 'Done button is present.');
    assert.dom('.buttons .cancel').exists({ count: 1 }, 'Cancel button is present.');
  });

  test('save', async function(assert) {
    assert.expect(2);
    const minimum = "5";
    const maximum = "10";
    const newMinimum = '50';
    const newMaximum = '100';
    const saveAction = function(min, max) {
      assert.equal(min, newMinimum, 'New minimum got passed to save action.');
      assert.equal(max, newMaximum, 'New maximum got passed to save action.');
    };
    this.set('minimum', minimum);
    this.set('maximum', maximum);
    this.set('saveAction', saveAction);
    await render(hbs`<CurriculumInventorySequenceBlockMinMaxEditor
      @minimum={{minimum}}
      @maximum={{maximum}}
      @save={{saveAction}}
    />`);
    await fillIn('.minimum input', newMinimum);
    await triggerEvent('.minimum input', 'input');
    await fillIn('.maximum input', newMaximum);
    await triggerEvent('.maximum input', 'input');
    await click('.buttons .done');
  });

  test('cancel', async function(assert) {
    assert.expect(1);
    const minimum = "5";
    const maximum = "10";
    const cancelAction = function() {
      assert.ok(true, 'Cancel action got invoked.');
    };
    this.set('minimum', minimum);
    this.set('maximum', maximum);
    this.set('cancelAction', cancelAction);
    await render(hbs`<CurriculumInventorySequenceBlockMinMaxEditor
      @minimum={{minimum}}
      @maximum={{maximum}}
      @cancel={{cancelAction}}
    />`);
    await click('.buttons .cancel');
  });

  test('save fails when minimum is larger than maximum', async function(assert) {
    assert.expect(2);
    const minimum = '0';
    const maximum = '0';
    const saveAction = function() {
      assert.ok(false, 'Save action should have not been invoked.');
    };
    this.set('minimum', minimum);
    this.set('maximum', maximum);
    this.set('saveAction', saveAction);
    await render(hbs`<CurriculumInventorySequenceBlockMinMaxEditor
      @minimum={{minimum}}
      @maximum={{maximum}}
      @save={{saveAction}}
    />`);
    assert.dom('.validation-error-message').doesNotExist('No initial validation errors.');
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
    const minimum = '0';
    const maximum = '0';
    const saveAction = function() {
      assert.ok(false, 'Save action should have not been invoked.');
    };
    this.set('minimum', minimum);
    this.set('maximum', maximum);
    this.set('saveAction', saveAction);
    await render(hbs`<CurriculumInventorySequenceBlockMinMaxEditor
      @minimum={{minimum}}
      @maximum={{maximum}}
      @save={{saveAction}}
    />`);
    assert.dom('.validation-error-message').doesNotExist('No initial validation errors.');
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
    const minimum = '0';
    const maximum = '0';
    const saveAction = function() {
      assert.ok(false, 'Save action should have not been invoked.');
    };
    this.set('minimum', minimum);
    this.set('maximum', maximum);
    this.set('saveAction', saveAction);
    await render(hbs`<CurriculumInventorySequenceBlockMinMaxEditor
      @minimum={{minimum}}
      @maximum={{maximum}}
      @save={{saveAction}}
    />`);
    assert.dom('.validation-error-message').doesNotExist('No initial validation errors.');
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
    const minimum = '0';
    const maximum = '0';
    const saveAction = function() {
      assert.ok(false, 'Save action should have not been invoked.');
    };
    this.set('minimum', minimum);
    this.set('maximum', maximum);
    this.set('saveAction', saveAction);
    await render(hbs`<CurriculumInventorySequenceBlockMinMaxEditor
      @minimum={{minimum}}
      @maximum={{maximum}}
      @save={{saveAction}}
    />`);
    assert.dom('.validation-error-message').doesNotExist('No initial validation errors.');
    await fillIn('.minimum input', '0');
    await triggerEvent('.minimum input', 'input');
    await fillIn('.maximum input', '');
    await triggerEvent('.maximum input', 'input');
    await click('.buttons .done');
    return settled().then(() => {
      assert.ok(findAll('.validation-error-message').length, 1, 'Validation error shows.');
    });
  });

  test('minimum field is set to 0 and disabled for electives', async function(assert) {
    assert.expect(4);
    const minimum = '10';
    const maximum = '20';
    const isElective = true;
    const saveAction = function(minimum /*, maximum */) {
      assert.equal(minimum, '0');
    };
    this.set('minimum', minimum);
    this.set('maximum', maximum);
    this.set('isElective', isElective);
    this.set('saveAction', saveAction);
    await render(hbs`<CurriculumInventorySequenceBlockMinMaxEditor
      @minimum={{minimum}}
      @maximum={{maximum}}
      @save={{saveAction}}
      @isElective={{isElective}}
    />`);
    assert.dom('.validation-error-message').doesNotExist('No initial validation errors.');
    assert.dom('.minimum input').hasValue('0');
    assert.dom('.minimum input').hasAttribute('disabled');
    await fillIn('.maximum input', '');
    await triggerEvent('.maximum input', 'input');
    await click('.buttons .done');
    return settled().then(() => {
      assert.ok(findAll('.validation-error-message').length, 1, 'Validation error shows.');
    });
  });
});
