import EmberObject from '@ember/object';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  settled,
  click,
  find,
  findAll,
  fillIn,
  triggerEvent
} from '@ember/test-helpers';
import { module, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import { openDatepicker } from 'ember-pikaday/helpers/pikaday';

module('Integration | Component | curriculum inventory sequence block dates duration editor', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    let block = EmberObject.create({
      startDate: moment('2016-04-23').toDate(),
      endDate: moment('2016-06-02').toDate(),
      duration: 10
    });
    this.set('sequenceBlock', block);
    await render(hbs`{{curriculum-inventory-sequence-block-dates-duration-editor sequenceBlock=sequenceBlock}}`);
    assert.dom('.start-date label').hasText('Start:', 'Start date is labeled correctly.');
    assert.dom('.start-date input').hasValue(
      moment(block.startDate).format('M/D/YYYY'),
      'Start date input has correct value.'
    );
    assert.dom('.end-date label').hasText('End:', 'End date input is labeled correctly.');
    assert.dom('.end-date input').hasValue(
      moment(block.endDate).format('M/D/YYYY'),
      'End date input has correct value.'
    );
    assert.dom('.duration label').hasText('Duration (in Days):', 'Duration input is labeled correctly.');
    assert.dom('.duration input').hasValue(block.duration, 'Duration input has correct value.');
    assert.dom('.buttons .done').exists({ count: 1 }, 'Done button is present.');
    assert.dom('.buttons .cancel').exists({ count: 1 }, 'Cancel button is present.');
  });

  test('save', async function(assert) {
    assert.expect(3);
    const newStartDate = moment('2016-10-30');
    const newEndDate = moment('2016-11-02');
    const newDuration = '5';
    let block = EmberObject.create({
      startDate: moment('2016-04-23').toDate(),
      endDate: moment('2016-06-02').toDate(),
      duration: 5
    });
    let saveAction = function(startDate, endDate, duration) {
      assert.equal(moment(startDate).format('YYYY-MM-DD'), newStartDate.format('YYYY-MM-DD'), 'New start date on save.');
      assert.equal(moment(endDate).format('YYYY-MM-DD'), newEndDate.format('YYYY-MM-DD'), 'New end date on save.');
      assert.equal(duration, newDuration, 'New duration on save');
    };
    this.set('block', block);
    this.set('saveAction', saveAction);
    await render(
      hbs`{{curriculum-inventory-sequence-block-dates-duration-editor sequenceBlock=block save=saveAction}}`
    );
    let interactor = openDatepicker(find('.start-date input'));
    interactor.selectDate(newStartDate.toDate());
    interactor = openDatepicker(find('.end-date input'));
    interactor.selectDate(newEndDate.toDate());
    await fillIn('.duration input', newDuration);
    await triggerEvent('.duration input', 'input');
    await click('.buttons .done');
  });

  test('save with date range and a zero duration', async function(assert) {
    assert.expect(3);
    const newStartDate = moment('2016-10-30');
    const newEndDate = moment('2016-11-02');
    const newDuration = '0';
    let block = EmberObject.create();
    let saveAction = function(startDate, endDate, duration) {
      assert.equal(moment(startDate).format('YYYY-MM-DD'), newStartDate.format('YYYY-MM-DD'), 'New start date on save.');
      assert.equal(moment(endDate).format('YYYY-MM-DD'), newEndDate.format('YYYY-MM-DD'), 'New end date on save.');
      assert.equal(duration, newDuration, 'New duration on save');
    };
    this.set('block', block);
    this.set('saveAction', saveAction);
    await render(
      hbs`{{curriculum-inventory-sequence-block-dates-duration-editor sequenceBlock=block save=saveAction}}`
    );
    let interactor = openDatepicker(find('.start-date input'));
    interactor.selectDate(newStartDate.toDate());
    interactor = openDatepicker(find('.end-date input'));
    interactor.selectDate(newEndDate.toDate());
    await fillIn('.duration input', newDuration);
    await triggerEvent('.duration input', 'input');
    await click('.buttons .done');
  });

  test('save with non-zero duration and no date range', async function(assert) {
    assert.expect(3);
    const newDuration = '5';
    let block = EmberObject.create();

    let saveAction = function(startDate, endDate, duration) {
      assert.equal(startDate, null, 'NULL for start date on save.');
      assert.equal(endDate, null, 'NULL for end date on save.');
      assert.equal(duration, newDuration, 'New duration on save.');
    };
    this.set('block', block);
    this.set('saveAction', saveAction);
    await render(
      hbs`{{curriculum-inventory-sequence-block-dates-duration-editor sequenceBlock=block save=saveAction}}`
    );
    await fillIn('.duration input', newDuration);
    await triggerEvent('.duration input', 'input');
    await click('.buttons .done');
  });

  test('cancel', async function(assert) {
    assert.expect(1);
    let block = EmberObject.create({
      startDate: moment('2016-04-23').toDate(),
      endDate: moment('2016-06-02').toDate(),
      duration: 10
    });
    let cancelAction = function() {
      assert.ok(true, 'Cancel action got invoked.');
    };
    this.set('block', block);
    this.set('cancel', cancelAction);
    await render(hbs`{{curriculum-inventory-sequence-block-dates-duration-editor sequenceBlock=block cancel=cancel}}`);
    await click('.buttons .cancel');
  });


  test('save fails if end-date is older than start-date', async function(assert) {
    assert.expect(2);
    const newStartDate = moment('2016-10-30');
    const newEndDate = moment('2013-11-02');
    let block = EmberObject.create({ duration: 0 });
    let saveAction = function() {
      assert.ok(false, 'Save action should have not been invoked.');
    };
    this.set('block', block);
    this.set('saveAction', saveAction);
    await render(
      hbs`{{curriculum-inventory-sequence-block-dates-duration-editor sequenceBlock=block save=saveAction}}`
    );
    assert.dom('.validation-error-message').doesNotExist('No initial validation errors.');
    let interactor = openDatepicker(find('.start-date input'));
    interactor.selectDate(newStartDate.toDate());
    interactor = openDatepicker(find('.end-date input'));
    interactor.selectDate(newEndDate.toDate());
    await click('.buttons .done');
    return settled().then(() => {
      assert.ok(findAll('.validation-error-message').length, 1, 'Validation error shows.');
    });
  });

  test('save fails on missing duration', async function(assert) {
    assert.expect(2);
    let block = EmberObject.create({
      startDate: moment('2016-04-23').toDate(),
      endDate: moment('2016-06-02').toDate(),
      duration: 10
    });
    let saveAction = function() {
      assert.ok(false, 'Save action should have not been invoked.');
    };
    this.set('block', block);
    this.set('saveAction', saveAction);
    await render(
      hbs`{{curriculum-inventory-sequence-block-dates-duration-editor sequenceBlock=block save=saveAction}}`
    );
    assert.dom('.validation-error-message').doesNotExist('No initial validation errors.');
    await fillIn('.duration input', '');
    await triggerEvent('.duration input', 'input');
    await click('.buttons .done');
    return settled().then(() => {
      assert.ok(findAll('.validation-error-message').length, 1, 'Validation error shows.');
    });
  });

  test('save fails on invalid duration', async function(assert) {
    assert.expect(2);
    let block = EmberObject.create({
      startDate: moment('2016-04-23').toDate(),
      endDate: moment('2016-06-02').toDate(),
      duration: 10
    });
    let saveAction = function() {
      assert.ok(false, 'Save action should have not been invoked.');
    };
    this.set('block', block);
    this.set('saveAction', saveAction);
    await render(
      hbs`{{curriculum-inventory-sequence-block-dates-duration-editor sequenceBlock=block save=saveAction}}`
    );
    assert.dom('.validation-error-message').doesNotExist('No initial validation errors.');
    await fillIn('.duration input', '-10');
    await triggerEvent('.duration input', 'input');
    await click('.buttons .done');
    return settled().then(() => {
      assert.ok(findAll('.validation-error-message').length, 1, 'Validation error shows.');
    });
  });

  test('save fails if neither date range nor duration is provided', async function(assert) {
    assert.expect(2);
    let block = EmberObject.create({ duration: 0 });
    let saveAction = function() {
      assert.ok(false, 'Save action should have not been invoked.');
    };
    this.set('block', block);
    this.set('saveAction', saveAction);
    await render(
      hbs`{{curriculum-inventory-sequence-block-dates-duration-editor sequenceBlock=block save=saveAction}}`
    );
    assert.dom('.validation-error-message').doesNotExist('No initial validation errors.');
    await click('.buttons .done');
    return settled().then(() => {
      assert.ok(findAll('.validation-error-message').length, 1, 'Validation error shows.');
    });
  });

  test('save fails if start-date is given but no end-date is provided', async function(assert) {
    assert.expect(2);
    let block = EmberObject.create({ duration: 0 });
    let saveAction = function() {
      assert.ok(false, 'Save action should have not been invoked.');
    };
    this.set('block', block);
    this.set('saveAction', saveAction);
    await render(
      hbs`{{curriculum-inventory-sequence-block-dates-duration-editor sequenceBlock=block save=saveAction}}`
    );
    assert.dom('.validation-error-message').doesNotExist('No initial validation errors.');
    let interactor = openDatepicker(find('.start-date input'));
    interactor.selectDate(new Date());
    await click('.buttons .done');
    return settled().then(() => {
      assert.ok(findAll('.validation-error-message').length, 1, 'Validation error shows.');
    });
  });
});
